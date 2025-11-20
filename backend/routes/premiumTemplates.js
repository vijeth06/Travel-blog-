const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const PremiumTemplate = require('../models/PremiumTemplate');
const Trip = require('../models/Trip');

router.use(protect);

// GET /api/premium-templates - List all active premium templates
router.get('/', async (req, res) => {
  try {
    const { category, destination, minDuration, maxDuration } = req.query;
    
    const query = { isActive: true, isPremium: true };
    
    if (category) query.category = category;
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (minDuration) query.duration = { $gte: parseInt(minDuration) };
    if (maxDuration) query.duration = { ...query.duration, $lte: parseInt(maxDuration) };

    const templates = await PremiumTemplate.find(query)
      .populate('createdBy', 'name')
      .sort({ purchaseCount: -1, rating: -1 });

    res.json({ success: true, data: templates });
  } catch (err) {
    console.error('Error fetching premium templates', err);
    res.status(500).json({ success: false, message: 'Failed to fetch premium templates' });
  }
});

// GET /api/premium-templates/:id - Get single template
router.get('/:id', async (req, res) => {
  try {
    const template = await PremiumTemplate.findById(req.params.id).populate('createdBy', 'name');
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, data: template });
  } catch (err) {
    console.error('Error fetching template', err);
    res.status(500).json({ success: false, message: 'Failed to fetch template' });
  }
});

// POST /api/premium-templates/:id/purchase - Purchase and clone template to user's trips
router.post('/:id/purchase', async (req, res) => {
  try {
    const template = await PremiumTemplate.findById(req.params.id);
    
    if (!template || !template.isActive) {
      return res.status(404).json({ success: false, message: 'Template not found or inactive' });
    }

    // TODO: In real app, integrate payment processing here
    // For now, we'll just clone the template

    // Clone template to user's trip
    const trip = await Trip.create({
      user: req.user.id,
      title: template.title,
      description: template.description,
      items: template.items.map(item => ({
        type: item.type,
        refId: item.refId,
        note: item.note || item.description,
      })),
    });

    // Increment purchase count
    template.purchaseCount += 1;
    await template.save();

    res.status(201).json({ 
      success: true, 
      data: trip,
      message: 'Template purchased and added to your trips',
    });
  } catch (err) {
    console.error('Error purchasing template', err);
    res.status(500).json({ success: false, message: 'Failed to purchase template' });
  }
});

// POST /api/premium-templates - Create premium template (admin/creator only)
router.post('/', async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const template = await PremiumTemplate.create(templateData);

    res.status(201).json({ success: true, data: template });
  } catch (err) {
    console.error('Error creating template', err);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

// PUT /api/premium-templates/:id - Update template
router.put('/:id', async (req, res) => {
  try {
    const template = await PremiumTemplate.findOne({ _id: req.params.id, createdBy: req.user.id });
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    Object.assign(template, req.body);
    await template.save();

    res.json({ success: true, data: template });
  } catch (err) {
    console.error('Error updating template', err);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

module.exports = router;
