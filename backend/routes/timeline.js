const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserTimeline } = require('../controllers/timelineController');

router.get('/', protect, getUserTimeline);

module.exports = router;
