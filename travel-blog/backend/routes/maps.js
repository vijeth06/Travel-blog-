const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const mapController = require('../controllers/mapController');

// Get geocoding data for location
router.get('/geocode', mapController.geocodeLocation);

// Get nearby places
router.get('/nearby', mapController.getNearbyPlaces);

// Get travel route between locations
router.get('/route', mapController.getRoute);

// Save user's favorite locations
router.post('/favorites', protect, mapController.saveFavoriteLocation);

// Get user's favorite locations
router.get('/favorites', protect, mapController.getFavoriteLocations);

// Delete favorite location
router.delete('/favorites/:id', protect, mapController.deleteFavoriteLocation);

module.exports = router;