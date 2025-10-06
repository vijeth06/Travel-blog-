const express = require('express');
const router = express.Router();
const travelBuddyController = require('../controllers/travelBuddyController');
const { protect } = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');

// Apply authentication middleware to all routes
router.use(protect);

// Profile routes
router.post('/profile', 
  createLimiter, // 5 requests per minute
  travelBuddyController.createProfile
);

router.get('/profile/:userId?', 
  travelBuddyController.getProfile
);

router.put('/profile/preferences', 
  createLimiter,
  travelBuddyController.updatePreferences
);

router.put('/profile/travel-plans', 
  createLimiter,
  travelBuddyController.updateTravelPlans
);

// Search and discovery routes
router.post('/search', 
  createLimiter,
  travelBuddyController.findBuddies
);

router.post('/search/advanced', 
  createLimiter,
  travelBuddyController.advancedSearch
);

router.get('/nearby', 
  createLimiter,
  travelBuddyController.getNearbyBuddies
);

router.get('/recommendations', 
  createLimiter,
  travelBuddyController.getRecommendations
);

// Connection and request routes
router.post('/request', 
  createLimiter,
  travelBuddyController.sendRequest
);

router.get('/requests', 
  travelBuddyController.getRequests
);

router.put('/requests/:requestId/respond', 
  createLimiter,
  travelBuddyController.respondToRequest
);

router.get('/connections/:userId?', 
  travelBuddyController.getConnections
);

// Review and rating routes
router.post('/review/:revieweeId', 
  createLimiter,
  travelBuddyController.addReview
);

// Safety and verification routes
router.put('/verify', 
  createLimiter,
  travelBuddyController.verifyProfile
);

router.put('/block/:buddyId', 
  createLimiter,
  travelBuddyController.toggleBlock
);

// Statistics routes
router.get('/stats/:userId?', 
  travelBuddyController.getStats
);

module.exports = router;
