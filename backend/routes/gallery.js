const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');

// Photo Gallery routes
router.post('/galleries', protect, galleryController.createGallery);
router.get('/galleries', protect, galleryController.getUserGalleries);
router.post('/galleries/:galleryId/photos', protect, galleryController.addPhotos);
router.get('/galleries/user/:userId', galleryController.getUserGalleries);
router.get('/galleries/:galleryId', galleryController.getGallery);
router.post('/galleries/:galleryId/like', protect, galleryController.toggleGalleryLike);
router.delete('/galleries/:galleryId', protect, galleryController.deleteGallery);

// Story routes
router.post('/stories', protect, galleryController.createStory);
router.get('/stories', protect, galleryController.getFollowingStories);
router.get('/stories/following', protect, galleryController.getFollowingStories);
router.get('/stories/user/:userId', protect, galleryController.getUserStories);
router.post('/stories/:storyId/view', protect, galleryController.viewStory);
router.delete('/stories/:storyId', protect, galleryController.deleteStory);
router.get('/stories/:storyId/viewers', protect, galleryController.getStoryViewers);

module.exports = router;
