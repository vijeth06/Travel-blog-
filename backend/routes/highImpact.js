const express = require('express');
const router = express.Router();
const highImpactService = require('../services/highImpactService');
const { protect } = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');

// Real-time Collaboration Routes
router.post('/collaboration/sessions', protect, [
    body('blogId').isMongoId().withMessage('Valid blog ID is required'),
    body('settings.maxCollaborators').optional().isInt({ min: 1, max: 50 }),
    body('settings.allowAnonymous').optional().isBoolean(),
    body('settings.requireApproval').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { blogId, settings } = req.body;
        const session = await highImpactService.createCollaborationSession(req.user.id, blogId, settings);
        
        res.status(201).json({
            success: true,
            data: session,
            message: 'Collaboration session created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/collaboration/sessions/:sessionId/join', protect, [
    param('sessionId').isUUID().withMessage('Valid session ID is required'),
    body('role').optional().isIn(['editor', 'commenter', 'viewer'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { sessionId } = req.params;
        const { role } = req.body;
        
        const session = await highImpactService.joinCollaborationSession(sessionId, req.user.id, role);
        
        res.json({
            success: true,
            data: session,
            message: 'Joined collaboration session successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/collaboration/sessions/:sessionId/operations', protect, [
    param('sessionId').isUUID().withMessage('Valid session ID is required'),
    body('type').isIn(['insert', 'delete', 'format']).withMessage('Valid operation type is required'),
    body('position').isInt({ min: 0 }).withMessage('Valid position is required'),
    body('content').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { sessionId } = req.params;
        const operation = req.body;
        
        const document = await highImpactService.updateDocument(sessionId, operation, req.user.id);
        
        res.json({
            success: true,
            data: document,
            message: 'Document updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Emergency Assistance Routes
router.post('/emergency/contacts', protect, [
    body('type').isIn(['personal', 'embassy', 'insurance', 'medical', 'local_emergency']).withMessage('Valid contact type is required'),
    body('name').notEmpty().trim().withMessage('Contact name is required'),
    body('phone').notEmpty().trim().withMessage('Phone number is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('country').optional().isLength({ min: 2, max: 2 }).withMessage('Valid country code is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const contact = await highImpactService.addEmergencyContact(req.user.id, req.body);
        
        res.status(201).json({
            success: true,
            data: contact,
            message: 'Emergency contact added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/emergency/alerts', protect, [
    body('type').isIn(['medical', 'safety', 'natural_disaster', 'political', 'transportation', 'theft', 'other']).withMessage('Valid alert type is required'),
    body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid severity is required'),
    body('title').notEmpty().trim().withMessage('Alert title is required'),
    body('description').notEmpty().trim().withMessage('Alert description is required'),
    body('location.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('location.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const alert = await highImpactService.createEmergencyAlert(req.user.id, req.body);
        
        res.status(201).json({
            success: true,
            data: alert,
            message: 'Emergency alert created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/emergency/contacts', protect, async (req, res) => {
    try {
        const { EmergencyContact } = require('../models/HighImpactFeatures');
        const contacts = await EmergencyContact.find({ user: req.user.id }).sort({ type: 1, isPrimary: -1 });
        
        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Blockchain Certificate Routes
router.post('/certificates', protect, [
    body('type').isIn(['trip_completion', 'milestone_achievement', 'travel_expert', 'community_contribution', 'safety_training']).withMessage('Valid certificate type is required'),
    body('title').notEmpty().trim().withMessage('Certificate title is required'),
    body('description').notEmpty().trim().withMessage('Certificate description is required'),
    body('criteria').isArray().withMessage('Criteria must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const certificate = await highImpactService.createCertificate(req.user.id, req.body);
        
        res.status(201).json({
            success: true,
            data: certificate,
            message: 'Certificate created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/certificates/:id/mint', protect, [
    param('id').isMongoId().withMessage('Valid certificate ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const certificate = await highImpactService.mintCertificateToBlockchain(id);
        
        res.json({
            success: true,
            data: certificate,
            message: 'Certificate minted to blockchain successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/certificates', protect, async (req, res) => {
    try {
        const { BlockchainCertificate } = require('../models/HighImpactFeatures');
        const certificates = await BlockchainCertificate.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: certificates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// AI Recommendations Routes
router.post('/ai/recommendations/generate', protect, [
    body('preferences.budget').optional().isIn(['low', 'medium', 'high']),
    body('preferences.travelStyle').optional().isString(),
    body('preferences.interests').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { preferences = {} } = req.body;
        const recommendations = await highImpactService.generatePersonalizedRecommendations(req.user.id, preferences);
        
        res.json({
            success: true,
            data: recommendations,
            message: 'AI recommendations generated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/ai/recommendations', protect, async (req, res) => {
    try {
        const { AIRecommendation } = require('../models/HighImpactFeatures');
        const { type, status, limit = 20 } = req.query;
        
        const filter = { user: req.user.id };
        if (type) filter.type = type;
        if (status) filter.status = status;
        
        const recommendations = await AIRecommendation.find(filter)
            .sort({ confidence: -1, createdAt: -1 })
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/ai/recommendations/:id/feedback', protect, [
    param('id').isMongoId().withMessage('Valid recommendation ID is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('wasHelpful').optional().isBoolean(),
    body('wasUsed').optional().isBoolean(),
    body('userComment').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { AIRecommendation } = require('../models/HighImpactFeatures');
        const { id } = req.params;
        
        const recommendation = await AIRecommendation.findOneAndUpdate(
            { _id: id, user: req.user.id },
            {
                feedback: {
                    ...req.body,
                    feedbackDate: new Date()
                },
                status: 'used'
            },
            { new: true }
        );
        
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: 'Recommendation not found'
            });
        }
        
        res.json({
            success: true,
            data: recommendation,
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Live Trip Updates Routes
router.post('/live-updates', protect, [
    body('type').isIn(['location', 'activity', 'photo', 'video', 'status', 'safety_checkin', 'milestone']).withMessage('Valid update type is required'),
    body('content.location.coordinates.lat').optional().isFloat({ min: -90, max: 90 }),
    body('content.location.coordinates.lng').optional().isFloat({ min: -180, max: 180 }),
    body('privacy').optional().isIn(['public', 'friends', 'family', 'private'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const update = await highImpactService.createLiveTripUpdate(req.user.id, req.body);
        
        res.status(201).json({
            success: true,
            data: update,
            message: 'Live trip update created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/live-updates/:userId/follow', protect, [
    param('userId').isMongoId().withMessage('Valid user ID is required'),
    body('notificationPreference').optional().isIn(['all', 'important', 'none'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req.params;
        const { notificationPreference = 'all' } = req.body;
        
        await highImpactService.followTrip(userId, req.user.id, notificationPreference);
        
        res.json({
            success: true,
            message: 'Successfully following trip updates'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/live-updates', protect, async (req, res) => {
    try {
        const { LiveTripUpdate } = require('../models/HighImpactFeatures');
        const { userId, type, limit = 20 } = req.query;
        
        const filter = {};
        if (userId) filter.user = userId;
        if (type) filter.type = type;
        
        // Only show public updates or updates from followed users
        const updates = await LiveTripUpdate.find(filter)
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            data: updates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Community Routes
router.post('/community/groups', protect, [
    body('name').notEmpty().trim().withMessage('Group name is required'),
    body('description').notEmpty().trim().withMessage('Group description is required'),
    body('type').isIn(['destination', 'activity', 'travel_style', 'budget', 'age_group', 'interest']).withMessage('Valid group type is required'),
    body('category').notEmpty().trim().withMessage('Group category is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const group = await highImpactService.createCommunityGroup(req.user.id, req.body);
        
        res.status(201).json({
            success: true,
            data: group,
            message: 'Community group created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/community/groups/:id/join', protect, [
    param('id').isMongoId().withMessage('Valid group ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const group = await highImpactService.joinCommunityGroup(id, req.user.id);
        
        res.json({
            success: true,
            data: group,
            message: 'Successfully joined community group'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/community/posts', protect, [
    body('title').notEmpty().trim().withMessage('Post title is required'),
    body('content').notEmpty().trim().withMessage('Post content is required'),
    body('type').isIn(['discussion', 'question', 'tip', 'photo', 'video', 'review', 'meetup', 'help']).withMessage('Valid post type is required'),
    body('group').optional().isMongoId().withMessage('Valid group ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const post = await highImpactService.createCommunityPost(req.user.id, req.body);
        
        res.status(201).json({
            success: true,
            data: post,
            message: 'Community post created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/community/groups', protect, async (req, res) => {
    try {
        const { CommunityGroup } = require('../models/HighImpactFeatures');
        const { type, category, search, limit = 20 } = req.query;
        
        const filter = { 'settings.isPublic': true };
        if (type) filter.type = type;
        if (category) filter.category = new RegExp(category, 'i');
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }
        
        const groups = await CommunityGroup.find(filter)
            .populate('creator', 'username avatar')
            .sort({ 'stats.memberCount': -1 })
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Gamification Routes
router.get('/gamification/profile', protect, async (req, res) => {
    try {
        const profile = await highImpactService.getUserGamificationProfile(req.user.id);
        
        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/gamification/award-points', protect, [
    body('category').isIn(['explorer', 'storyteller', 'connector', 'adventurer', 'helper', 'safety']).withMessage('Valid category is required'),
    body('points').isInt({ min: 1, max: 1000 }).withMessage('Valid points amount is required'),
    body('reason').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { category, points, reason } = req.body;
        const stats = await highImpactService.awardPoints(req.user.id, category, points, reason);
        
        res.json({
            success: true,
            data: stats,
            message: 'Points awarded successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/gamification/achievements', protect, async (req, res) => {
    try {
        const { Achievement, HighImpactUserAchievement } = require('../models/HighImpactFeatures');
        const { category, completed } = req.query;
        
        let achievements;
        if (completed) {
            // Get user's completed achievements
            achievements = await HighImpactUserAchievement.find({ 
                user: req.user.id, 
                isCompleted: true 
            }).populate('achievement');
        } else {
            // Get all available achievements
            const filter = { isActive: true };
            if (category) filter.category = category;
            
            achievements = await Achievement.find(filter).sort({ 'stats.totalEarned': -1 });
        }
        
        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Analytics Route
router.get('/analytics', protect, async (req, res) => {
    try {
        const analytics = await highImpactService.getHighImpactAnalytics(req.user.id);
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
