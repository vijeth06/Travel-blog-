const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', countryController.getCountries);
router.get('/search', countryController.searchCountries);
router.get('/featured', countryController.getFeaturedCountries);
router.get('/continent/:continent', countryController.getCountriesByContinent);
router.get('/india/regions', countryController.getIndianRegions);
router.get('/currency/:countryCode', countryController.getCountryCurrency);
router.get('/:identifier', countryController.getCountry);
router.get('/:identifier/destinations', countryController.getPopularDestinations);

module.exports = router;