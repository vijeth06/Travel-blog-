const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Badge = require('../models/Badge');
const User = require('../models/User');
const Blog = require('../models/Blog');

router.use(protect);

// GET /api/badges/user/:userId - Get user's badges
router.get('/user/:userId', async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.params.userId, isVisible: true }).sort({ awardedAt: -1 });
    res.json({ success: true, data: badges });
  } catch (err) {
    console.error('Error fetching badges', err);
    res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
});

// GET /api/badges/my - Get current user's badges
router.get('/my', async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user.id }).sort({ awardedAt: -1 });
    res.json({ success: true, data: badges });
  } catch (err) {
    console.error('Error fetching my badges', err);
    res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
});

// POST /api/badges/check - Auto-check and award badges based on criteria
router.post('/check', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const blogs = await Blog.find({ author: userId, status: 'published' });
    
    const newBadges = [];

    // Certified Guide - 10+ published blogs
    if (blogs.length >= 10) {
      const existing = await Badge.findOne({ user: userId, badgeType: 'certified_guide' });
      if (!existing) {
        const badge = await Badge.create({
          user: userId,
          badgeType: 'certified_guide',
          level: 'bronze',
          criteria: '10+ published travel blogs',
        });
        newBadges.push(badge);
      }
    }

    // Top Contributor - 25+ published blogs
    if (blogs.length >= 25) {
      const existing = await Badge.findOne({ user: userId, badgeType: 'top_contributor' });
      if (!existing) {
        const badge = await Badge.create({
          user: userId,
          badgeType: 'top_contributor',
          level: 'silver',
          criteria: '25+ published travel blogs',
        });
        newBadges.push(badge);
      }
    }

    // Verified Traveler - Based on total views
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
    if (totalViews >= 1000) {
      const existing = await Badge.findOne({ user: userId, badgeType: 'verified_traveler' });
      if (!existing) {
        const badge = await Badge.create({
          user: userId,
          badgeType: 'verified_traveler',
          level: 'gold',
          criteria: '1000+ total blog views',
        });
        newBadges.push(badge);
      }
    }

    res.json({ success: true, data: newBadges, message: `${newBadges.length} new badges awarded` });
  } catch (err) {
    console.error('Error checking badges', err);
    res.status(500).json({ success: false, message: 'Failed to check badges' });
  }
});

// PUT /api/badges/:id/visibility - Toggle badge visibility
router.put('/:id/visibility', async (req, res) => {
  try {
    const badge = await Badge.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    badge.isVisible = !badge.isVisible;
    await badge.save();

    res.json({ success: true, data: badge });
  } catch (err) {
    console.error('Error toggling badge visibility', err);
    res.status(500).json({ success: false, message: 'Failed to toggle badge visibility' });
  }
});

module.exports = router;
