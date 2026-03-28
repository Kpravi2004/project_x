const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEOAPIFY_API_KEY;

exports.fetchAmenities = async (lat, lon, radius = 2000) => {
  try {
    const categories = [
      'education.school',
      'healthcare.hospital',
      'public_transport.bus',
      'commercial.supermarket',
      'leisure.park',
      'service.financial.bank'   // correct category for banks
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

    const getNearest = (items) => {
      if (items.length === 0) return null;
      return items[0].properties.distance || null;
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
        nearest_school_m: getNearest(processed.schools),
        nearest_hospital_m: getNearest(processed.hospitals),
        nearest_bus_m: getNearest(processed.bus_stops),
        nearest_supermarket_m: getNearest(processed.supermarkets),
        nearest_park_m: getNearest(processed.parks),
        nearest_bank_m: getNearest(processed.banks)
      }
    };
  } catch (err) {
    console.error('Geoapify fetch error:', err.response?.data || err.message);
    throw new Error('Failed to fetch amenities from Geoapify');
  }
};