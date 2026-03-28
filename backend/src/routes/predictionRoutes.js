const express = require('express');
const router = express.Router();
const geoapifyService = require('../services/geoapifyService');
const predictionController = require('../controllers/predictionController');

// Existing routes
router.post('/', predictionController.predictPrice);
router.post('/train', predictionController.trainPriceModel);

// New amenities route
router.get('/amenities', async (req, res) => {
  try {
    const { lat, lng, radius, detailed } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }
    const amenities = await geoapifyService.fetchAmenities(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius) : 2000
    );
    // If detailed=true, you could also add the full items list.
    // The service already returns counts and distances.
    res.json(amenities);
  } catch (error) {
    console.error('Amenities fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;