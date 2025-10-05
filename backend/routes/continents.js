const express = require('express');
const router = express.Router();
const {
  getContinents,
  getContinent,
  getFamousPlaces,
  getPlaceCategories,
  searchContinents,
  getContinentStats
} = require('../controllers/continentController');

// Public routes
router.get('/', getContinents);
router.get('/search', searchContinents);
router.get('/stats', getContinentStats);
router.get('/:identifier', getContinent);
router.get('/:identifier/places', getFamousPlaces);
router.get('/:identifier/categories', getPlaceCategories);

module.exports = router;