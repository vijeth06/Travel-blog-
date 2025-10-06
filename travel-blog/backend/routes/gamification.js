const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { createLimiter } = require('../middleware/rateLimiter');

// Public routes (no protect required)
router.get('/challenges/featured', 
  createLimiter,
  gamificationController.getFeaturedChallenges
);

router.get('/challenges/active', 
  createLimiter,
  gamificationController.getActiveChallenges
);

router.get('/leaderboard', 
  createLimiter,
  gamificationController.getLeaderboard
);

router.get('/badges', 
  createLimiter,
  gamificationController.getBadges
);

// Apply authentication middleware to protected routes
router.use(protect);

// User stats and profile routes
router.get('/stats/:userId?', 
  gamificationController.getUserStats
);

router.get('/dashboard', 
  createLimiter,
  gamificationController.getDashboard
);

router.get('/badges/user/:userId?', 
  gamificationController.getUserBadges
);

router.get('/achievements/progress', 
  createLimiter,
  gamificationController.getAchievementProgress
);

router.get('/points/history/:userId?', 
  gamificationController.getPointsHistory
);

// Challenge participation routes
router.post('/challenges/:challengeId/join', 
  createLimiter,
  gamificationController.joinChallenge
);

router.put('/challenges/:challengeId/progress', 
  createLimiter,
  gamificationController.updateProgress
);

router.delete('/challenges/:challengeId/leave', 
  createLimiter,
  gamificationController.leaveChallenge
);

router.post('/challenges/:challengeId/proof', 
  createLimiter,
  gamificationController.submitProof
);

router.get('/challenges/:challengeId', 
  gamificationController.getChallengeDetails
);

router.get('/challenges/:challengeId/leaderboard', 
  gamificationController.getChallengeLeaderboard
);

router.get('/challenges/user/:userId?', 
  gamificationController.getUserChallenges
);

// Points system routes
router.post('/points/award', 
  createLimiter,
  gamificationController.awardPoints
);

router.post('/badges/check', 
  createLimiter,
  gamificationController.checkBadges
);

// Challenge management routes (authenticated users can create)
router.post('/challenges', 
  createLimiter,
  gamificationController.createChallenge
);

router.put('/challenges/:challengeId', 
  createLimiter,
  gamificationController.updateChallenge
);

router.delete('/challenges/:challengeId', 
  createLimiter,
  gamificationController.deleteChallenge
);

// Admin only routes
router.get('/admin/stats', 
  adminAuth,
  gamificationController.getGamificationStats
);

module.exports = router;