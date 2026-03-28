const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEOAPIFY_API_KEY;

// Haversine distance in meters
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

exports.fetchAmenities = async (lat, lon, radius = 2000) => {
  try {
    const categories = [
      'education.school',
      'healthcare.hospital',
      'public_transport.bus',
      'commercial.supermarket',
      'leisure.park',
      'service.financial.bank'
    ].join(',');

    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${radius}&limit=20&apiKey=${API_KEY}`;
    const response = await axios.get(url);
    const features = response.data.features || [];

    const filterByCategory = (cat) => features.filter(f =>
      f.properties.categories && f.properties.categories.includes(cat)
    );

    const processed = {
      schools: filterByCategory('education.school'),
      hospitals: filterByCategory('healthcare.hospital'),
      bus_stops: filterByCategory('public_transport.bus'),
      supermarkets: filterByCategory('commercial.supermarket'),
      parks: filterByCategory('leisure.park'),
      banks: filterByCategory('service.financial.bank')
    };

    const getNearestDistance = (items) => {
      if (items.length === 0) return null;
      // Use API distance if available, otherwise compute
      const item = items[0];
      if (item.properties.distance) return item.properties.distance;
      // Compute distance using coordinates
      const featLat = item.geometry.coordinates[1];
      const featLon = item.geometry.coordinates[0];
      return haversineDistance(lat, lon, featLat, featLon);
    };

    return {
      raw: features,
      counts: {
        schools: processed.schools.length,
        hospitals: processed.hospitals.length,
        bus_stops: processed.bus_stops.length,
        supermarkets: processed.supermarkets.length,
        parks: processed.parks.length,
        banks: processed.banks.length
      },
      distances: {
        nearest_school_m: getNearestDistance(processed.schools),
        nearest_hospital_m: getNearestDistance(processed.hospitals),
        nearest_bus_m: getNearestDistance(processed.bus_stops),
        nearest_supermarket_m: getNearestDistance(processed.supermarkets),
        nearest_park_m: getNearestDistance(processed.parks),
        nearest_bank_m: getNearestDistance(processed.banks)
      }
    };
  } catch (err) {
    console.error('Geoapify fetch error:', err.response?.data || err.message);
    throw new Error('Failed to fetch amenities from Geoapify');
  }
};