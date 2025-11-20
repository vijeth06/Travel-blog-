const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Trip = require('../models/Trip');
const Package = require('../models/Package');
const Blog = require('../models/Blog');
const crypto = require('crypto');

router.use(protect);

// GET /api/trips - list current user's trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: trips });
  } catch (err) {
    console.error('Error fetching trips', err);
    res.status(500).json({ success: false, message: 'Failed to fetch trips' });
  }
});

// POST /api/trips - create trip
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const trip = await Trip.create({
      user: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
    });
    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    console.error('Error creating trip', err);
    res.status(500).json({ success: false, message: 'Failed to create trip' });
  }
});

// GET /api/trips/:id - get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.json({ success: true, data: trip });
  } catch (err) {
    console.error('Error fetching trip', err);
    res.status(500).json({ success: false, message: 'Failed to fetch trip' });
  }
});

// PUT /api/trips/:id - update trip
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    if (title && title.trim()) trip.title = title.trim();
    if (typeof description === 'string') trip.description = description.trim();
    await trip.save();
    res.json({ success: true, data: trip });
  } catch (err) {
    console.error('Error updating trip', err);
    res.status(500).json({ success: false, message: 'Failed to update trip' });
  }
});

// POST /api/trips/:id/items - add item
router.post('/:id/items', async (req, res) => {
  try {
    const { type, refId, note } = req.body;
    if (!['package', 'blog', 'place'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }
    if (!refId) {
      return res.status(400).json({ success: false, message: 'refId is required' });
    }
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    trip.items.push({ type, refId, note: note ? note.trim() : '' });
    await trip.save();
    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    console.error('Error adding trip item', err);
    res.status(500).json({ success: false, message: 'Failed to add trip item' });
  }
});

// DELETE /api/trips/:id/items/:itemId - remove item
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    trip.items.id(req.params.itemId)?.remove();
    await trip.save();
    res.json({ success: true, data: trip });
  } catch (err) {
    console.error('Error removing trip item', err);
    res.status(500).json({ success: false, message: 'Failed to remove trip item' });
  }
});

// DELETE /api/trips/:id - delete trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.json({ success: true, message: 'Trip deleted' });
  } catch (err) {
    console.error('Error deleting trip', err);
    res.status(500).json({ success: false, message: 'Failed to delete trip' });
  }
});

// POST /api/trips/auto-build - generate a smart trip based on preferences
router.post('/auto-build', async (req, res) => {
  try {
    const { title, destination, days = 3, budget = 'medium', interests = [] } = req.body || {};

    const tripTitle = (title && title.trim()) || (destination ? `${destination} Trip` : 'Smart Trip');

    const packageQuery = {};
    if (destination) {
      packageQuery.location = { $regex: destination, $options: 'i' };
    }

    if (budget === 'low') {
      packageQuery.price = { $lt: 500 };
    } else if (budget === 'high') {
      packageQuery.price = { $gt: 1500 };
    }

    const packageFilters = [packageQuery];
    const blogFilters = [];

    if (Array.isArray(interests) && interests.length > 0) {
      // Assume tags/categories field if present
      packageFilters.push({ tags: { $in: interests } });
      blogFilters.push({ tags: { $in: interests } });
    }

    const packageFindQuery = packageFilters.length > 1 ? { $and: packageFilters } : packageFilters[0];
    const blogBaseQuery = destination ? { location: { $regex: destination, $options: 'i' } } : {};
    const blogFindQuery = blogFilters.length > 0 ? { $and: [blogBaseQuery, ...blogFilters] } : blogBaseQuery;

    const [packages, blogs] = await Promise.all([
      Package.find(packageFindQuery).sort({ 'rating.average': -1, views: -1 }).limit(10),
      Blog.find(blogFindQuery).sort({ views: -1 }).limit(10)
    ]);

    const items = [];
    const maxItems = Math.max(days * 2, 3);
    let pIndex = 0;
    let bIndex = 0;

    while (items.length < maxItems && (pIndex < packages.length || bIndex < blogs.length)) {
      if (pIndex < packages.length) {
        items.push({ type: 'package', refId: packages[pIndex]._id, note: packages[pIndex].title });
        pIndex += 1;
      }
      if (items.length >= maxItems) break;
      if (bIndex < blogs.length) {
        items.push({ type: 'blog', refId: blogs[bIndex]._id, note: blogs[bIndex].title });
        bIndex += 1;
      }
    }

    const trip = await Trip.create({
      user: req.user.id,
      title: tripTitle,
      description: destination
        ? `Auto-built trip for ${destination} (${days} days, ${budget} budget)`
        : `Auto-built trip (${days} days, ${budget} budget)`,
      items
    });

    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    console.error('Error auto-building trip', err);
    res.status(500).json({ success: false, message: 'Failed to auto-build trip' });
  }
});

// POST /api/trips/:id/share - generate share link
router.post('/:id/share', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    if (!trip.shareToken) {
      trip.shareToken = crypto.randomBytes(16).toString('hex');
    }
    trip.isPublic = true;
    await trip.save();
    
    res.json({ success: true, data: { shareToken: trip.shareToken } });
  } catch (err) {
    console.error('Error sharing trip', err);
    res.status(500).json({ success: false, message: 'Failed to share trip' });
  }
});

// GET /api/trips/shared/:token - view public trip (no auth required)
router.get('/shared/:token', async (req, res) => {
  try {
    const trip = await Trip.findOne({ shareToken: req.params.token, isPublic: true }).populate('user', 'name');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or not public' });
    }
    res.json({ success: true, data: trip });
  } catch (err) {
    console.error('Error fetching shared trip', err);
    res.status(500).json({ success: false, message: 'Failed to fetch shared trip' });
  }
});

// GET /api/trips/:id/suggestions - get smart suggestions for this trip
router.get('/:id/suggestions', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const destination = trip.title || trip.description || '';
    const existingRefIds = trip.items.map(item => item.refId.toString());

    const [packages, blogs] = await Promise.all([
      Package.find({ 
        _id: { $nin: existingRefIds },
        $or: [
          { location: { $regex: destination, $options: 'i' } },
          { title: { $regex: destination, $options: 'i' } }
        ]
      }).sort({ 'rating.average': -1 }).limit(5),
      Blog.find({ 
        _id: { $nin: existingRefIds },
        $or: [
          { location: { $regex: destination, $options: 'i' } },
          { title: { $regex: destination, $options: 'i' } }
        ]
      }).sort({ views: -1 }).limit(5)
    ]);

    res.json({ success: true, data: { packages, blogs } });
  } catch (err) {
    console.error('Error getting trip suggestions', err);
    res.status(500).json({ success: false, message: 'Failed to get suggestions' });
  }
});

// GET /api/trips/:id/cost - calculate trip cost estimate
router.get('/:id/cost', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const packageItems = trip.items.filter(item => item.type === 'package');
    const packageIds = packageItems.map(item => item.refId);
    
    const packages = await Package.find({ _id: { $in: packageIds } });
    
    const totalCost = packages.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
    const days = trip.endDate && trip.startDate 
      ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))
      : 3;
    
    const estimatedDailyCost = 100;
    const foodAndMiscCost = days * estimatedDailyCost;
    
    res.json({ 
      success: true, 
      data: { 
        packagesCost: totalCost,
        estimatedDailyCost: foodAndMiscCost,
        totalEstimate: totalCost + foodAndMiscCost,
        days
      } 
    });
  } catch (err) {
    console.error('Error calculating trip cost', err);
    res.status(500).json({ success: false, message: 'Failed to calculate cost' });
  }
});

module.exports = router;
