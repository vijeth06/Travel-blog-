const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');

// Itinerary CRUD
router.post('/', protect, itineraryController.createItinerary);
router.get('/', protect, itineraryController.getUserItineraries);
router.get('/user/:userId', itineraryController.getUserItineraries);
router.get('/saved', protect, itineraryController.getSavedItineraries);
router.get('/search', itineraryController.searchItineraries);
router.get('/:itineraryId', itineraryController.getItinerary);
router.put('/:itineraryId', protect, itineraryController.updateItinerary);
router.delete('/:itineraryId', protect, itineraryController.deleteItinerary);

// Days and activities
router.post('/:itineraryId/days', protect, itineraryController.addDay);
router.post('/:itineraryId/days/:dayId/activities', protect, itineraryController.addActivity);

// Engagement
router.post('/:itineraryId/like', protect, itineraryController.toggleLike);
router.post('/:itineraryId/save', protect, itineraryController.toggleSave);

// Collaboration
router.post('/:itineraryId/collaborators', protect, itineraryController.addCollaborator);

module.exports = router;
