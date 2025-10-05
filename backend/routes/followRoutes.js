const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all follow routes
router.use(authenticateUser);

/**
 * @route   POST /api/follow/user
 * @desc    Follow a user
 * @access  Private
 */
router.post('/user', followController.followUser);

/**
 * @route   POST /api/follow/unfollow
 * @desc    Unfollow a user
 * @access  Private
 */
router.post('/unfollow', followController.unfollowUser);

/**
 * @route   POST /api/follow/toggle
 * @desc    Toggle follow status (follow if not following, unfollow if following)
 * @access  Private
 */
router.post('/toggle', followController.toggleFollow);

/**
 * @route   GET /api/follow/status/:userId
 * @desc    Get following status between current user and specified user
 * @access  Private
 */
router.get('/status/:userId', followController.getFollowingStatus);

/**
 * @route   GET /api/follow/followers/:userId
 * @desc    Get user's followers
 * @access  Public (but requires auth for detailed info)
 */
router.get('/followers/:userId', followController.getFollowers);

/**
 * @route   GET /api/follow/following/:userId
 * @desc    Get users that a user is following
 * @access  Public (but requires auth for detailed info)
 */
router.get('/following/:userId', followController.getFollowing);

/**
 * @route   GET /api/follow/suggestions
 * @desc    Get follow suggestions for current user
 * @access  Private
 */
router.get('/suggestions', followController.getFollowSuggestions);

/**
 * @route   GET /api/follow/mutual/:userId
 * @desc    Get mutual follows between current user and specified user
 * @access  Private
 */
router.get('/mutual/:userId', followController.getMutualFollows);

/**
 * @route   POST /api/follow/bulk
 * @desc    Follow multiple users at once
 * @access  Private
 */
router.post('/bulk', followController.bulkFollow);

/**
 * @route   GET /api/follow/analytics/:userId
 * @desc    Get follow analytics for a user
 * @access  Public (but requires auth for mutual follows)
 */
router.get('/analytics/:userId', followController.getFollowAnalytics);

module.exports = router;