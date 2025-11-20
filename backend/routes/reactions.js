const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Reaction = require('../models/Reaction');

router.use(protect);

// POST /api/reactions - Add or update reaction
router.post('/', async (req, res) => {
  try {
    const { targetType, targetId, reactionType } = req.body;
    
    if (!targetType || !targetId || !reactionType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Remove existing reaction from same user on same target
    await Reaction.deleteMany({ user: req.user.id, targetType, targetId });

    // Add new reaction
    const reaction = await Reaction.create({
      user: req.user.id,
      targetType,
      targetId,
      reactionType,
    });

    res.status(201).json({ success: true, data: reaction });
  } catch (err) {
    console.error('Error adding reaction', err);
    res.status(500).json({ success: false, message: 'Failed to add reaction' });
  }
});

// DELETE /api/reactions - Remove reaction
router.delete('/', async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    
    await Reaction.deleteMany({ user: req.user.id, targetType, targetId });
    
    res.json({ success: true, message: 'Reaction removed' });
  } catch (err) {
    console.error('Error removing reaction', err);
    res.status(500).json({ success: false, message: 'Failed to remove reaction' });
  }
});

// GET /api/reactions/:targetType/:targetId - Get reactions for a target
router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const reactions = await Reaction.find({
      targetType: req.params.targetType,
      targetId: req.params.targetId,
    }).populate('user', 'name');

    // Group by reaction type
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.reactionType]) {
        acc[reaction.reactionType] = [];
      }
      acc[reaction.reactionType].push(reaction);
      return acc;
    }, {});

    const summary = Object.keys(grouped).map(type => ({
      type,
      count: grouped[type].length,
      users: grouped[type].map(r => r.user),
    }));

    res.json({ success: true, data: { reactions, summary } });
  } catch (err) {
    console.error('Error fetching reactions', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reactions' });
  }
});

// GET /api/reactions/my/:targetType/:targetId - Get current user's reaction
router.get('/my/:targetType/:targetId', async (req, res) => {
  try {
    const reaction = await Reaction.findOne({
      user: req.user.id,
      targetType: req.params.targetType,
      targetId: req.params.targetId,
    });

    res.json({ success: true, data: reaction });
  } catch (err) {
    console.error('Error fetching user reaction', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user reaction' });
  }
});

module.exports = router;
