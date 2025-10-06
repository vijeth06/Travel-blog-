const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

// @route   POST /api/recommendations/generate
// @desc    Generate recommendations for user
// @access  Private
router.post('/generate', protect, recommendationController.generateRecommendations);

// @route   GET /api/recommendations
// @desc    Get user recommendations
// @access  Private
router.get('/', protect, recommendationController.getUserRecommendations);

// @route   POST /api/recommendations/:id/interaction
// @desc    Mark recommendation interaction
// @access  Private
router.post('/:id/interaction', protect, recommendationController.markInteraction);

// @route   GET /api/recommendations/stats
// @desc    Get recommendation statistics
// @access  Private
router.get('/stats', protect, recommendationController.getRecommendationStats);

// @route   POST /api/recommendations/refresh
// @desc    Refresh recommendations
// @access  Private
router.post('/refresh', protect, recommendationController.refreshRecommendations);

// @route   GET /api/recommendations/trending
// @desc    Get trending content
// @access  Public
router.get('/trending', recommendationController.getTrendingContent);

// @route   GET /api/recommendations/similar-users
// @desc    Get similar users
// @access  Private
router.get('/similar-users', protect, recommendationController.getSimilarUsers);

// @route   POST /api/recommendations/:id/feedback
// @desc    Submit recommendation feedback
// @access  Private
router.post('/:id/feedback', protect, recommendationController.submitRecommendationFeedback);

module.exports = router;