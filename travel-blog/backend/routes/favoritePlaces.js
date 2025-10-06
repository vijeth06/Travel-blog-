const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getFavoritePlaces,
  getFavoritePlacesByContinent,
  getMostPopularByContinent,
  getFavoritePlaceBySlug,
  createFavoritePlace,
  updateFavoritePlace,
  deleteFavoritePlace,
  toggleLikePlace,
  addCommentToPlace,
  getMyFavoritePlaces
} = require('../controllers/favoritePlaceController');

// Validation middleware
const validateFavoritePlace = [
  body('placeName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Place name must be between 2 and 100 characters'),
  body('continent')
    .isIn(['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Antarctica'])
    .withMessage('Invalid continent'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('personalTips')
    .optional()
    .isArray()
    .withMessage('Personal tips must be an array'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

// Public routes
router.get('/', getFavoritePlaces);
router.get('/continent/:continent', getFavoritePlacesByContinent);
router.get('/popular-by-continent', getMostPopularByContinent);
router.get('/slug/:slug', getFavoritePlaceBySlug);

// Protected routes (require authentication)
router.get('/user/my-places', protect, getMyFavoritePlaces);
router.post('/', optionalAuth, validateFavoritePlace, createFavoritePlace);
router.put('/:id', protect, validateFavoritePlace, updateFavoritePlace);
router.delete('/:id', protect, deleteFavoritePlace);
router.post('/:id/like', protect, toggleLikePlace);
router.post('/:id/comments', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
], addCommentToPlace);

module.exports = router;