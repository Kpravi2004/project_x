const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const predictionController = require('../controllers/predictionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/pending-properties', auth, admin, adminController.getPendingProperties);
router.get('/check-match/:id', auth, admin, adminController.checkMatch);
router.post('/verify-property/:id', auth, admin, adminController.verifyProperty);
router.post('/request-amenities/:id', auth, admin, adminController.requestAmenities);
router.post('/fetch-amenities/:id', auth, admin, adminController.fetchAmenitiesForProperty);
router.get('/properties', auth, admin, adminController.getAllProperties);
router.put('/properties/:id', auth, admin, adminController.updateProperty);
router.delete('/properties/:id', auth, admin, adminController.deleteProperty);
router.post('/train/price-model', auth, admin, predictionController.trainPriceModel);

module.exports = router;