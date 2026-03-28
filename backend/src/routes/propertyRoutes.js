const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer to keep file extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, `${hash}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', propertyController.getProperties);
router.get('/my-properties', auth, propertyController.getMyProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', auth, propertyController.createOrUpdateDraft);
router.post('/finalize', auth, upload.array('media', 10), propertyController.finalizeProperty);
router.post('/:id/submit-amenities', auth, propertyController.submitAmenities);

module.exports = router;