const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Collection = require('../models/Collection');

router.use(protect);

// GET /api/collections - list current user's collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: collections });
  } catch (err) {
    console.error('Error fetching collections', err);
    res.status(500).json({ success: false, message: 'Failed to fetch collections' });
  }
});

// GET /api/collections/public - list public collections
router.get('/public', async (req, res) => {
  try {
    const collections = await Collection.find({ isPublic: true })
      .populate('user', 'name')
      .sort({ views: -1 })
      .limit(20);
    res.json({ success: true, data: collections });
  } catch (err) {
    console.error('Error fetching public collections', err);
    res.status(500).json({ success: false, message: 'Failed to fetch public collections' });
  }
});

// POST /api/collections - create collection
router.post('/', async (req, res) => {
  try {
    const { title, description, isPublic, tags } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    const collection = await Collection.create({
      user: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      isPublic: isPublic || false,
      tags: tags || [],
    });
    res.status(201).json({ success: true, data: collection });
  } catch (err) {
    console.error('Error creating collection', err);
    res.status(500).json({ success: false, message: 'Failed to create collection' });
  }
});

// GET /api/collections/:id - get single collection
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('user', 'name');
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    
    // Allow access if owner or if public
    if (collection.user._id.toString() !== req.user.id && !collection.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Increment views if not owner
    if (collection.user._id.toString() !== req.user.id) {
      collection.views += 1;
      await collection.save();
    }
    
    res.json({ success: true, data: collection });
  } catch (err) {
    console.error('Error fetching collection', err);
    res.status(500).json({ success: false, message: 'Failed to fetch collection' });
  }
});

// PUT /api/collections/:id - update collection
router.put('/:id', async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user.id });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    
    const { title, description, isPublic, tags } = req.body;
    if (title) collection.title = title.trim();
    if (description !== undefined) collection.description = description.trim();
    if (isPublic !== undefined) collection.isPublic = isPublic;
    if (tags) collection.tags = tags;
    
    await collection.save();
    res.json({ success: true, data: collection });
  } catch (err) {
    console.error('Error updating collection', err);
    res.status(500).json({ success: false, message: 'Failed to update collection' });
  }
});

// DELETE /api/collections/:id - delete collection
router.delete('/:id', async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.json({ success: true, message: 'Collection deleted' });
  } catch (err) {
    console.error('Error deleting collection', err);
    res.status(500).json({ success: false, message: 'Failed to delete collection' });
  }
});

// POST /api/collections/:id/items - add item to collection
router.post('/:id/items', async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user.id });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    
    const { type, refId } = req.body;
    if (!type || !refId) {
      return res.status(400).json({ success: false, message: 'Type and refId are required' });
    }
    
    collection.items.push({ type, refId });
    await collection.save();
    
    res.json({ success: true, data: collection });
  } catch (err) {
    console.error('Error adding item', err);
    res.status(500).json({ success: false, message: 'Failed to add item' });
  }
});

// DELETE /api/collections/:id/items/:itemId - remove item from collection
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user.id });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    
    collection.items = collection.items.filter(item => item._id.toString() !== req.params.itemId);
    await collection.save();
    
    res.json({ success: true, data: collection });
  } catch (err) {
    console.error('Error removing item', err);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});

// POST /api/collections/:id/follow - follow/unfollow collection
router.post('/:id/follow', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    
    const index = collection.followers.indexOf(req.user.id);
    if (index > -1) {
      collection.followers.splice(index, 1);
    } else {
      collection.followers.push(req.user.id);
    }
    
    await collection.save();
    res.json({ success: true, data: collection });
  } catch (err) {
    console.error('Error following collection', err);
    res.status(500).json({ success: false, message: 'Failed to follow collection' });
  }
});

module.exports = router;
