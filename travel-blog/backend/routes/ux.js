const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const uxService = require('../services/uxService');

// Theme Management Routes
router.get('/theme', protect, async (req, res) => {
    try {
        const theme = await uxService.getUserTheme(req.user.id);
        res.json(theme);
    } catch (error) {
        console.error('Get theme error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/theme', 
    protect,
    [
        body('theme').optional().isIn(['light', 'dark', 'auto']),
        body('colorScheme.primary').optional().isHexColor(),
        body('colorScheme.secondary').optional().isHexColor(),
        body('customizations.fontSize').optional().isIn(['small', 'medium', 'large']),
        body('customizations.animations').optional().isBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const theme = await uxService.updateTheme(req.user.id, req.body);
            res.json(theme);
        } catch (error) {
            console.error('Update theme error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/theme/css', protect, async (req, res) => {
    try {
        const theme = await uxService.getUserTheme(req.user.id);
        const css = await uxService.generateThemeCSS(theme);
        
        res.set('Content-Type', 'text/css');
        res.send(css);
    } catch (error) {
        console.error('Get theme CSS error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bookmark Management Routes
router.post('/bookmarks',
    protect,
    [
        body('type').isIn(['blog', 'place', 'package', 'user', 'collection']),
        body('itemId').isMongoId(),
        body('title').notEmpty().trim().isLength({ max: 200 }),
        body('folder').optional().isString()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const bookmark = await uxService.createBookmark(req.user.id, req.body);
            res.status(201).json(bookmark);
        } catch (error) {
            console.error('Create bookmark error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/bookmarks', 
    protect,
    [
        query('folder').optional().isString(),
        query('type').optional().isIn(['blog', 'place', 'package', 'user', 'collection'])
    ],
    async (req, res) => {
        try {
            const { folder, type } = req.query;
            const bookmarks = await uxService.getUserBookmarks(req.user.id, folder, type);
            res.json(bookmarks);
        } catch (error) {
            console.error('Get bookmarks error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/bookmarks/folders',
    protect,
    [
        body('name').notEmpty().trim().isLength({ max: 100 }),
        body('description').optional().isString().isLength({ max: 500 }),
        body('color').optional().isHexColor(),
        body('parent').optional().isMongoId()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const folder = await uxService.createBookmarkFolder(req.user.id, req.body);
            res.status(201).json(folder);
        } catch (error) {
            console.error('Create bookmark folder error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/bookmarks/folders', protect, async (req, res) => {
    try {
        const folders = await uxService.getBookmarkFolders(req.user.id);
        res.json(folders);
    } catch (error) {
        console.error('Get bookmark folders error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/bookmarks/:id/move',
    protect,
    [
        body('folder').isString()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const bookmark = await uxService.moveBookmark(req.user.id, req.params.id, req.body.folder);
            res.json(bookmark);
        } catch (error) {
            console.error('Move bookmark error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.delete('/bookmarks/:id', protect, async (req, res) => {
    try {
        const result = await uxService.deleteBookmark(req.user.id, req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Delete bookmark error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Enhanced Search Routes
router.get('/search',
    protect,
    [
        query('q').notEmpty().trim().isLength({ min: 1, max: 200 }),
        query('type').optional().isIn(['general', 'blogs', 'places', 'packages', 'users']),
        query('location').optional().isString(),
        query('categories').optional().isArray(),
        query('sortBy').optional().isIn(['relevance', 'date', 'popularity', 'rating']),
        query('dateStart').optional().isISO8601(),
        query('dateEnd').optional().isISO8601()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { q, type = 'general', location, categories, sortBy, dateStart, dateEnd, author } = req.query;
            
            const filters = {
                ...(location && { location }),
                ...(categories && { categories: Array.isArray(categories) ? categories : [categories] }),
                ...(sortBy && { sortBy }),
                ...(dateStart && dateEnd && { 
                    dateRange: { start: dateStart, end: dateEnd } 
                }),
                ...(author && { author })
            };

            const results = await uxService.performEnhancedSearch(req.user.id, q, filters, type);
            res.json(results);
        } catch (error) {
            console.error('Enhanced search error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/search/suggestions',
    protect,
    [
        query('q').optional().isString(),
        query('type').optional().isIn(['general', 'blogs', 'places', 'packages', 'users'])
    ],
    async (req, res) => {
        try {
            const { q = '', type = 'general' } = req.query;
            const suggestions = await uxService.getSearchSuggestions(q, type);
            res.json(suggestions);
        } catch (error) {
            console.error('Get search suggestions error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/search/history', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const history = await uxService.getSearchHistory(req.user.id, limit);
        res.json(history);
    } catch (error) {
        console.error('Get search history error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Review System Routes
router.post('/reviews',
    protect,
    [
        body('targetType').isIn(['blog', 'place', 'package', 'user', 'experience']),
        body('targetId').isMongoId(),
        body('rating.overall').isInt({ min: 1, max: 5 }),
        body('title').optional().isString().isLength({ max: 100 }),
        body('content').optional().isString().isLength({ max: 2000 }),
        body('pros').optional().isArray(),
        body('cons').optional().isArray(),
        body('visitDate').optional().isISO8601(),
        body('tripType').optional().isIn(['solo', 'couple', 'family', 'friends', 'business'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const review = await uxService.createReview(req.user.id, req.body);
            res.status(201).json(review);
        } catch (error) {
            console.error('Create review error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/reviews/:targetType/:targetId',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 }),
        query('sortBy').optional().isIn(['helpful', 'recent', 'rating'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { targetType, targetId } = req.params;
            const { page = 1, limit = 10, sortBy = 'helpful' } = req.query;

            const reviews = await uxService.getReviews(
                targetType, 
                targetId, 
                parseInt(page), 
                parseInt(limit), 
                sortBy
            );
            
            res.json(reviews);
        } catch (error) {
            console.error('Get reviews error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/reviews/:id/vote',
    protect,
    [
        body('helpful').isBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const review = await uxService.voteOnReview(req.user.id, req.params.id, req.body.helpful);
            res.json(review);
        } catch (error) {
            console.error('Vote on review error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// Quick Actions Routes
router.get('/quick-actions', protect, async (req, res) => {
    try {
        const actions = await uxService.getQuickActions(req.user.id);
        res.json(actions);
    } catch (error) {
        console.error('Get quick actions error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/quick-actions',
    protect,
    [
        body('*').isArray(),
        body('*.action').isIn(['create_blog', 'search_places', 'check_weather', 'book_flight', 'save_place', 'share_blog', 'view_stats', 'export_data']),
        body('*.title').isString().isLength({ max: 100 }),
        body('*.icon').isString(),
        body('*.url').isString(),
        body('*.isEnabled').isBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const actions = await uxService.updateQuickActions(req.user.id, req.body);
            res.json(actions);
        } catch (error) {
            console.error('Update quick actions error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/quick-actions/:id/use', protect, async (req, res) => {
    try {
        await uxService.recordQuickActionUsage(req.user.id, req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Record quick action usage error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Accessibility Routes
router.get('/accessibility', protect, async (req, res) => {
    try {
        const preferences = await uxService.getAccessibilityPreferences(req.user.id);
        res.json(preferences);
    } catch (error) {
        console.error('Get accessibility preferences error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/accessibility',
    protect,
    [
        body('visualPreferences.fontSize').optional().isIn(['small', 'medium', 'large', 'extra-large']),
        body('visualPreferences.highContrast').optional().isBoolean(),
        body('motionPreferences.reducedMotion').optional().isBoolean(),
        body('navigationPreferences.keyboardNavigation').optional().isBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const preferences = await uxService.updateAccessibilityPreferences(req.user.id, req.body);
            res.json(preferences);
        } catch (error) {
            console.error('Update accessibility preferences error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// UX Analytics Routes
router.post('/metrics',
    protect,
    [
        body('page').notEmpty().isString(),
        body('action').notEmpty().isString(),
        body('element').optional().isString(),
        body('duration').optional().isInt({ min: 0 }),
        body('sessionId').optional().isString()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Add client metadata
            const metricData = {
                ...req.body,
                metadata: {
                    ...req.body.metadata,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip,
                    referer: req.get('Referer')
                }
            };

            const metric = await uxService.recordUXMetric(req.user.id, metricData);
            res.json({ success: true });
        } catch (error) {
            console.error('Record UX metric error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/insights',
    protect,
    [
        query('timeRange').optional().isIn(['7d', '30d', '90d', '365d'])
    ],
    async (req, res) => {
        try {
            const { timeRange = '30d' } = req.query;
            const insights = await uxService.getUXInsights(req.user.id, timeRange);
            res.json(insights);
        } catch (error) {
            console.error('Get UX insights error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// Notification Preferences Routes
router.get('/notifications/preferences', protect, async (req, res) => {
    try {
        let preferences = await NotificationPreferences.findOne({ user: req.user.id });
        
        if (!preferences) {
            preferences = new NotificationPreferences({
                user: req.user.id,
                email: { enabled: true, frequency: 'daily' },
                push: { enabled: true },
                inApp: { enabled: true }
            });
            await preferences.save();
        }

        res.json(preferences);
    } catch (error) {
        console.error('Get notification preferences error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/notifications/preferences',
    protect,
    [
        body('email.enabled').optional().isBoolean(),
        body('email.frequency').optional().isIn(['immediate', 'daily', 'weekly']),
        body('push.enabled').optional().isBoolean(),
        body('inApp.enabled').optional().isBoolean(),
        body('quietHours.enabled').optional().isBoolean()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const preferences = await NotificationPreferences.findOneAndUpdate(
                { user: req.user.id },
                req.body,
                { upsert: true, new: true }
            );

            res.json(preferences);
        } catch (error) {
            console.error('Update notification preferences error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// Export user data (GDPR compliance)
router.get('/export', protect, async (req, res) => {
    try {
        const userData = {
            theme: await uxService.getUserTheme(req.user.id),
            bookmarks: await uxService.getUserBookmarks(req.user.id),
            bookmarkFolders: await uxService.getBookmarkFolders(req.user.id),
            searchHistory: await uxService.getSearchHistory(req.user.id, 100),
            quickActions: await uxService.getQuickActions(req.user.id),
            accessibility: await uxService.getAccessibilityPreferences(req.user.id),
            exportDate: new Date().toISOString()
        };

        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="user-preferences-export.json"'
        });
        
        res.json(userData);
    } catch (error) {
        console.error('Export user data error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        features: {
            themes: true,
            bookmarks: true,
            search: true,
            reviews: true,
            quickActions: true,
            accessibility: true,
            analytics: true
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
