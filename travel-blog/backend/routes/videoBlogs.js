const express = require('express');
const router = express.Router();
const videoBlogController = require('../controllers/videoBlogController');
const { protect } = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', 
  createLimiter,
  videoBlogController.getVideoBlogs
);

router.get('/trending', 
  createLimiter,
  videoBlogController.getTrendingVideos
);

router.get('/search', 
  createLimiter,
  videoBlogController.searchVideoBlogs
);

router.get('/series/:seriesId', 
  createLimiter,
  videoBlogController.getVideoSeriesById
);

router.get('/:videoBlogId', 
  createLimiter,
  videoBlogController.getVideoBlog
);

// Apply authentication middleware to protected routes
router.use(protect);

// Video upload and management
router.post('/upload', 
  createLimiter, // 5 uploads per minute
  videoBlogController.uploadVideo
);

router.post('/', 
  createLimiter,
  videoBlogController.createVideoBlog
);

router.put('/:videoBlogId', 
  createLimiter,
  videoBlogController.updateVideoBlog
);

router.delete('/:videoBlogId', 
  createLimiter,
  videoBlogController.deleteVideoBlog
);

// Video series management
router.post('/series', 
  createLimiter,
  videoBlogController.createVideoSeries
);

router.put('/series/:seriesId', 
  createLimiter,
  videoBlogController.updateVideoSeries
);

router.delete('/series/:seriesId', 
  createLimiter,
  videoBlogController.deleteVideoSeries
);

router.put('/series/:seriesId/videos/:videoBlogId', 
  createLimiter,
  videoBlogController.addVideoToSeries
);

// Video interaction
router.put('/:videoBlogId/like', 
  createLimiter,
  videoBlogController.toggleLike
);

router.post('/:videoBlogId/view', 
  createLimiter,
  videoBlogController.updateViewCount
);

// Analytics and insights
router.get('/:videoBlogId/analytics', 
  createLimiter,
  videoBlogController.getVideoAnalytics
);

router.post('/:videoBlogId/transcript', 
  createLimiter,
  videoBlogController.generateTranscript
);

// User videos
router.get('/user/:userId', 
  videoBlogController.getUserVideoBlogs
);

module.exports = router;