const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const gamificationController = require('../controllers/realGamificationController');

// All routes require authentication
router.use(protect);

// User progress and stats
router.get('/progress', gamificationController.getUserProgress);
router.get('/stats', gamificationController.getUserStats);

// Points and achievements
router.post('/award-points', gamificationController.awardPoints);
router.post('/track-activity', gamificationController.trackActivity);
router.get('/achievements', gamificationController.getAchievements);

// Leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

// Challenges
router.post('/challenges', gamificationController.createChallenge);
router.post('/challenges/:challengeId/join', gamificationController.joinChallenge);
router.put('/challenges/:challengeId/progress', gamificationController.updateProgress);

// Admin routes (could add admin middleware later)
router.post('/initialize-achievements', gamificationController.initializeAchievements);

module.exports = router;