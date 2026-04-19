const AMENITY_CREDITS = {
  school: { base: 10000, max_dist: 5000 },
  hospital: { base: 15000, max_dist: 5000 },
  bus_stop: { base: 5000, max_dist: 2000 },
  supermarket: { base: 8000, max_dist: 3000 },
  park: { base: 7000, max_dist: 3000 },
  bank: { base: 6000, max_dist: 3000 }
};

/**
 * Computes predicted price bonus based on nearby amenities
 * @param {Object} counts - Object with amenity counts (e.g., schools, hospitals)
 * @param {Object} distances - Object with nearest distances in meters
 * @param {Object} property - The property object containing the base price
 * @returns {Object} - Prediction result with total bonus and breakdown
 */
const computeCreditPrediction = (counts, distances, property) => {
  let totalBonus = 0;
  const breakdown = {};

  for (const [key, config] of Object.entries(AMENITY_CREDITS)) {
    const count = counts[key + 's'] || 0;
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

  // ENFORCE CAP: Maximum 1/3 of base price
  const maxBonus = parseFloat(property.price) / 3;
  if (totalBonus > maxBonus) {
    const ratio = maxBonus / totalBonus;
    totalBonus = maxBonus;
    for (const key in breakdown) {
      breakdown[key] = breakdown[key] * ratio;
    }
  }

  return {
    predicted_price: parseFloat(property.price) + totalBonus,
    original_price: property.price,
    amenity_bonus: totalBonus,
    breakdown
  };
};

module.exports = {
  AMENITY_CREDITS,
  computeCreditPrediction
};
