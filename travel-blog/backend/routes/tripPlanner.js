const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const tripPlannerController = require('../controllers/tripPlannerController');

// Validation middleware
const validateTripPlan = [
  body('destination.name').notEmpty().withMessage('Destination name is required'),
  body('destination.country').notEmpty().withMessage('Destination country is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('budget.min').isNumeric().withMessage('Budget minimum must be a number'),
  body('budget.max').isNumeric().withMessage('Budget maximum must be a number'),
  body('travelers.adults').isInt({ min: 1 }).withMessage('At least 1 adult required'),
  body('travelStyle').isIn(['budget', 'mid-range', 'luxury', 'backpacking', 'family', 'romantic', 'adventure', 'cultural'])
    .withMessage('Invalid travel style')
];

// @route   POST /api/trip-planner/generate
// @desc    Generate AI trip plan
// @access  Private
router.post('/generate', protect, validateTripPlan, tripPlannerController.generateTripPlan);

// @route   GET /api/trip-planner/my-plans
// @desc    Get user's trip plans
// @access  Private
router.get('/my-plans', protect, tripPlannerController.getUserTripPlans);

// @route   GET /api/trip-planner/:id
// @desc    Get specific trip plan
// @access  Private
router.get('/:id', protect, tripPlannerController.getTripPlan);

// @route   PUT /api/trip-planner/:id
// @desc    Update trip plan
// @access  Private
router.put('/:id', protect, tripPlannerController.updateTripPlan);

// @route   DELETE /api/trip-planner/:id
// @desc    Delete trip plan
// @access  Private
router.delete('/:id', protect, tripPlannerController.deleteTripPlan);

// @route   POST /api/trip-planner/:id/share
// @desc    Share trip plan
// @access  Private
router.post('/:id/share', protect, tripPlannerController.shareTripPlan);

// @route   GET /api/trip-planner/shared/:shareCode
// @desc    Get trip plan by share code
// @access  Public
router.get('/shared/:shareCode', tripPlannerController.getTripPlanByShareCode);

// @route   POST /api/trip-planner/:id/optimize
// @desc    Optimize trip plan
// @access  Private
router.post('/:id/optimize', protect, tripPlannerController.optimizeTripPlan);

// @route   POST /api/trip-planner/:id/clone
// @desc    Clone trip plan
// @access  Private
router.post('/:id/clone', protect, tripPlannerController.cloneTripPlan);

// @route   GET /api/trip-planner/recommendations/personalized
// @desc    Get personalized recommendations
// @access  Private
router.get('/recommendations/personalized', protect, tripPlannerController.getRecommendations);

module.exports = router;
