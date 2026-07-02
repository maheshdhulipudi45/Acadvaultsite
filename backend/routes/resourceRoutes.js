const express = require('express');
const router = express.Router();
const {
  checkDuplicate,
  uploadResource,
  getResources,
  getResourceById,
  rateResource,
  downloadResource,
  reportResource,
  getRecommendations,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getResources);
router.get('/:id', getResourceById);
router.get('/:id/recommendations', getRecommendations);

// Protected routes (require login)
router.post('/check-duplicate', protect, checkDuplicate);
router.post('/upload', protect, upload.single('file'), uploadResource);
router.post('/:id/rate', protect, rateResource);
router.post('/:id/download', protect, downloadResource);
router.post('/:id/report', protect, reportResource);

module.exports = router;
