const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  createReview,
  getReviews,
  getReviewStats,
  updateReview,
  deleteReview,
  markHelpful,
  markNotHelpful,
  addResponse,
  flagReview,
  getUserReviews,
  getTrendingReviews,
  searchReviews
} = require('../controllers/reviewController');

// Validation middleware
const validateReview = [
  body('targetType')
    .isIn(['destination', 'hotel', 'restaurant', 'activity', 'package', 'blog', 'guide'])
    .withMessage('Invalid target type'),
  body('targetId')
    .isMongoId()
    .withMessage('Invalid target ID'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('overallRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5'),
  body('visitDate')
    .isISO8601()
    .withMessage('Invalid visit date'),
  body('wouldRecommend')
    .isBoolean()
    .withMessage('Would recommend must be true or false')
];

const validateResponse = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Response content must be between 1 and 500 characters')
];

const validateFlag = [
  body('reason')
    .isIn(['inappropriate', 'spam', 'fake', 'offensive', 'other'])
    .withMessage('Invalid flag reason'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
];

// Public routes
router.get('/search', searchReviews);
router.get('/trending', getTrendingReviews);
router.get('/:targetType/:targetId', optionalAuth, getReviews);
router.get('/:targetType/:targetId/stats', getReviewStats);
router.get('/user/:userId', getUserReviews);

// Protected routes
router.use(protect);

// Create review
router.post('/', validateReview, createReview);

// Update review
router.put('/:reviewId', validateReview, updateReview);

// Delete review
router.delete('/:reviewId', deleteReview);

// Mark review as helpful/not helpful
router.post('/:reviewId/helpful', markHelpful);
router.post('/:reviewId/not-helpful', markNotHelpful);

// Add response to review
router.post('/:reviewId/responses', validateResponse, addResponse);

// Flag review
router.post('/:reviewId/flag', validateFlag, flagReview);

module.exports = router;