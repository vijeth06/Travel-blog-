const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const TopicFollow = require('../models/TopicFollow');
const Blog = require('../models/Blog');

router.use(protect);

// POST /api/topic-follows - Follow a topic
router.post('/', async (req, res) => {
  try {
    const { followType, followValue, notificationsEnabled = true } = req.body;
    
    if (!followType || !followValue) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const follow = await TopicFollow.findOneAndUpdate(
      { user: req.user.id, followType, followValue },
      { notificationsEnabled },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: follow });
  } catch (err) {
    console.error('Error following topic', err);
    res.status(500).json({ success: false, message: 'Failed to follow topic' });
  }
});

// DELETE /api/topic-follows - Unfollow a topic
router.delete('/', async (req, res) => {
  try {
    const { followType, followValue } = req.body;
    
    await TopicFollow.deleteOne({ user: req.user.id, followType, followValue });
    
    res.json({ success: true, message: 'Topic unfollowed' });
  } catch (err) {
    console.error('Error unfollowing topic', err);
    res.status(500).json({ success: false, message: 'Failed to unfollow topic' });
  }
});

// GET /api/topic-follows - Get user's followed topics
router.get('/', async (req, res) => {
  try {
    const follows = await TopicFollow.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: follows });
  } catch (err) {
    console.error('Error fetching topic follows', err);
    res.status(500).json({ success: false, message: 'Failed to fetch topic follows' });
  }
});

// GET /api/topic-follows/feed - Get personalized feed based on followed topics
router.get('/feed', async (req, res) => {
  try {
    const follows = await TopicFollow.find({ user: req.user.id });
    
    if (follows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Build query based on followed topics
    const queries = [];
    
    follows.forEach(follow => {
      if (follow.followType === 'tag') {
        queries.push({ tags: follow.followValue });
      } else if (follow.followType === 'continent') {
        queries.push({ 'geotag.continent': follow.followValue });
      } else if (follow.followType === 'country') {
        queries.push({ 'geotag.country': follow.followValue });
      } else if (follow.followType === 'city') {
        queries.push({ 'geotag.city': follow.followValue });
      }
    });

    const blogs = await Blog.find({
      status: 'published',
      $or: queries,
    })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(20);

    res.json({ success: true, data: blogs });
  } catch (err) {
    console.error('Error fetching personalized feed', err);
    res.status(500).json({ success: false, message: 'Failed to fetch personalized feed' });
  }
});

// GET /api/topic-follows/check - Check if user follows a topic
router.get('/check/:followType/:followValue', async (req, res) => {
  try {
    const follow = await TopicFollow.findOne({
      user: req.user.id,
      followType: req.params.followType,
      followValue: req.params.followValue,
    });

    res.json({ success: true, data: { isFollowing: !!follow } });
  } catch (err) {
    console.error('Error checking topic follow', err);
    res.status(500).json({ success: false, message: 'Failed to check topic follow' });
  }
});

module.exports = router;
