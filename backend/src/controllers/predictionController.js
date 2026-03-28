const db = require('../config/database');
const MLR = require('ml-regression-multivariate-linear');

// Amenity credit definitions
const AMENITY_CREDITS = {
  school: { base: 50000, max_dist: 2000 },
  hospital: { base: 60000, max_dist: 3000 },
  bus_stop: { base: 20000, max_dist: 1000 },
  supermarket: { base: 15000, max_dist: 1500 },
  park: { base: 10000, max_dist: 2000 },
  bank: { base: 15000, max_dist: 1000 }
};

// Helper: Load MLR model (optional)
async function loadModel(landTypeId) {
  const res = await db.query(
    'SELECT model_data FROM trained_models WHERE land_type_id = $1 AND model_data IS NOT NULL',
    [landTypeId]
  );
  if (res.rows.length === 0) return null;
  return MLR.load(res.rows[0].model_data);
}

// Helper: Compute credit‑based price
function computeCreditPrediction(property, amenitiesData) {
  const counts = amenitiesData?.counts || {};
  const distances = amenitiesData?.distances || {};
  let totalBonus = 0;
  const breakdown = {};

  for (const [key, config] of Object.entries(AMENITY_CREDITS)) {
    const count = counts[key + 's'] || 0; // e.g., schools, hospitals, bus_stops, etc.
    let distance = Infinity;
    if (key === 'school') distance = distances.nearest_school_m || config.max_dist;
    else if (key === 'hospital') distance = distances.nearest_hospital_m || config.max_dist;
    else if (key === 'bus_stop') distance = distances.nearest_bus_m || config.max_dist;
    else if (key === 'supermarket') distance = distances.nearest_supermarket_m || config.max_dist;
    else if (key === 'park') distance = distances.nearest_park_m || config.max_dist;
    else if (key === 'bank') distance = distances.nearest_bank_m || config.max_dist;

    const distanceFactor = Math.max(0, 1 - (distance / config.max_dist));
    const bonus = config.base * count * distanceFactor;
    totalBonus += bonus;
    breakdown[key] = bonus;
  }

  return {
    predicted_price: parseFloat(property.price) + totalBonus,
    original_price: property.price,
    amenity_bonus: totalBonus,
    breakdown
  };
}

// Helper: Get annual appreciation from price history (non‑linear because used in compound growth)
async function getAnnualAppreciation(propertyId, district = null) {
  const ownHistory = await db.query(`
    SELECT recorded_date, price FROM price_history
    WHERE property_id = $1 ORDER BY recorded_date
  `, [propertyId]);

  if (ownHistory.rows.length >= 2) {
    let totalRate = 0;
    let count = 0;
    for (let i = 1; i < ownHistory.rows.length; i++) {
      const prev = ownHistory.rows[i - 1];
      const curr = ownHistory.rows[i];
      const years = (new Date(curr.recorded_date) - new Date(prev.recorded_date)) / (365 * 24 * 60 * 60 * 1000);
      if (years > 0) {
        const rate = (curr.price / prev.price) - 1;
        totalRate += rate / years;
        count++;
      }
    }
    if (count > 0) return totalRate / count;
  }

  if (district) {
    const districtAvg = await db.query(`
      SELECT AVG(ph.price / p.price - 1) as avg_rate
      FROM price_history ph
      JOIN properties p ON ph.property_id = p.id
      WHERE p.district = $1 AND p.created_at < ph.recorded_date
    `, [district]);
    if (districtAvg.rows[0].avg_rate) return parseFloat(districtAvg.rows[0].avg_rate);
  }
  return 0.05; // default 5%
}

// POST /api/predict
exports.predictPrice = async (req, res) => {
  try {
    const { property_id, target_year } = req.body;
    if (!property_id) return res.status(400).json({ message: 'property_id required' });

    const propRes = await db.query('SELECT * FROM properties WHERE id = $1', [property_id]);
    if (propRes.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    const property = propRes.rows[0];
    const amenitiesData = property.amenities_data || property.user_provided_amenities;

    // If target_year is given and an MLR model exists, use it (optional)
    if (target_year) {
      const model = await loadModel(property.land_type_id);
      if (model) {
        // Build feature vector (simplified – you may need to adapt)
        const features = [
          parseFloat(property.area) || 0,
          parseFloat(property.distance_to_cbd_km) || 0,
          Math.log((parseFloat(property.nearest_bus_distance_m) || 0) + 1),
          Math.log((parseFloat(property.nearest_railway_distance_m) || 0) + 1),
          Math.log((parseFloat(property.nearest_school_distance_m) || 0) + 1),
          Math.log((parseFloat(property.nearest_hospital_distance_m) || 0) + 1),
          property.schools_1km_count || 0,
          property.hospitals_2km_count || 0,
          target_year
        ];
        const pred = model.predict([features]);
        const predicted_price = pred[0];
        return res.json({ predicted_price, original_price: property.price, target_year, model_used: 'mlr' });
      }
    }

    // Fallback to credit‑based prediction
    const creditPred = computeCreditPrediction(property, amenitiesData);
    if (!target_year) {
      return res.json(creditPred);
    }

    // Future year projection using compound growth (non‑linear)
    const annualRate = await getAnnualAppreciation(property_id, property.district);
    const currentYear = new Date().getFullYear();
    const years = target_year - currentYear;
    const futurePrice = creditPred.predicted_price * Math.pow(1 + annualRate, years);

    return res.json({
      predicted_price: futurePrice,
      original_price: property.price,
      current_predicted: creditPred.predicted_price,
      target_year,
      annual_growth_rate: annualRate,
      model_used: 'credit_with_appreciation'
    });
  } catch (err) {
    console.error('predictPrice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin endpoint: train MLR model (optional)
exports.trainPriceModel = async (req, res) => {
  res.status(200).json({ message: 'Model training not implemented in this version' });
};