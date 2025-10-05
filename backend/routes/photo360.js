const express = require('express');
const router = express.Router();
const photo360Controller = require('../controllers/photo360Controller');
const { protect } = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', 
  createLimiter,
  photo360Controller.get360Photos
);

router.get('/featured', 
  createLimiter,
  photo360Controller.getFeatured360Photos
);

router.get('/search', 
  createLimiter,
  photo360Controller.search360Photos
);

router.get('/location/nearby', 
  createLimiter,
  photo360Controller.getPhotosByLocation
);

router.get('/:photoId', 
  createLimiter,
  photo360Controller.get360Photo
);

router.get('/:photoId/metadata', 
  createLimiter,
  photo360Controller.getPhotoMetadata
);

router.get('/:photoId/nearby', 
  createLimiter,
  photo360Controller.getNearby360Photos
);

// Apply authentication middleware to protected routes
router.use(protect);

// Photo upload and management
router.post('/upload', 
  createLimiter, // 10 uploads per minute
  photo360Controller.upload360Photo
);

router.post('/upload/bulk', 
  createLimiter, // 2 bulk uploads per minute
  photo360Controller.bulkUpload360Photos
);

router.post('/', 
  createLimiter,
  photo360Controller.create360Photo
);

router.put('/:photoId', 
  createLimiter,
  photo360Controller.update360Photo
);

router.delete('/:photoId', 
  createLimiter,
  photo360Controller.delete360Photo
);

// Hotspot management
router.post('/:photoId/hotspots', 
  createLimiter,
  photo360Controller.addHotspot
);

router.put('/:photoId/hotspots/:hotspotId', 
  createLimiter,
  photo360Controller.updateHotspot
);

router.delete('/:photoId/hotspots/:hotspotId', 
  createLimiter,
  photo360Controller.deleteHotspot
);

// Photo interaction
router.put('/:photoId/like', 
  createLimiter,
  photo360Controller.toggleLike
);

// Advanced features
router.put('/:photoId/projection', 
  createLimiter,
  photo360Controller.updateProjectionSettings
);

router.post('/:photoId/validate', 
  createLimiter,
  photo360Controller.validate360Format
);

router.get('/:photoId/stats', 
  createLimiter,
  photo360Controller.getPhotoStats
);

// Virtual tours
router.post('/tours/generate', 
  createLimiter,
  photo360Controller.generate360PhotoTour
);

// User photos
router.get('/user/:userId', 
  photo360Controller.getUser360Photos
);

module.exports = router;