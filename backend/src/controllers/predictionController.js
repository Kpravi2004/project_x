const db = require('../config/database');
const MLR = require('ml-regression-multivariate-linear');

const { computeCreditPrediction } = require('../utils/valuation');

/**
 * Helper: Compute credit‑based price using property's columns
 */
function getCreditPrediction(property) {
  // Extract counts and distances from columns
  const counts = {
    schools: property.schools_1km_count || 0,
    hospitals: property.hospitals_2km_count || 0,
    bus_stops: property.bus_stops_1km_count || 0,
    supermarkets: property.supermarkets_1km_count || 0,
    parks: property.parks_1km_count || 0,
    banks: property.banks_1km_count || 0
  };
  const distances = {
    nearest_school_m: property.nearest_school_distance_m,
    nearest_hospital_m: property.nearest_hospital_distance_m,
    nearest_bus_m: property.nearest_bus_stop_distance_m,
    nearest_supermarket_m: property.nearest_supermarket_distance_m,
    nearest_park_m: property.nearest_park_distance_m,
    nearest_bank_m: property.nearest_bank_distance_m
  };

  return computeCreditPrediction(counts, distances, property);
}

// Annual appreciation rates (sample values)
const APPRECIATION_RATES = {
  1: 0.12, // Agricultural (12%)
  2: 0.20, // Residential (20%)
  default: 0.15 // Default (15%)
};

// Helper: Get annual appreciation from price history
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

    // Fallback to credit‑based prediction using columns
    const creditPred = getCreditPrediction(property);
    if (!target_year) {
      return res.json(creditPred);
    }

    // Future year projection using Linear Regression approach (linear growth)
    // Formula: FuturePrice = CurrentPrice + (BasePrice * AnnualRate * Years)
    const annualRate = await getAnnualAppreciation(property_id, property.district);
    const currentYear = 2026; // Setting current year as base relative to user's 2026 context
    const years = Math.max(0, target_year - currentYear);
    
    // Future price = (Base + Amenities) * (1 + Rate * Years)
    const futurePrice = creditPred.predicted_price * (1 + annualRate * years);

    return res.json({
      predicted_price: futurePrice,
      original_price: property.price,
      current_predicted: creditPred.predicted_price,
      target_year,
      annual_growth_rate: annualRate,
      model_used: 'multiple_linear_regression_fallback'
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