const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const calendarService = require('../services/calendarService');
const socialMediaService = require('../services/socialMediaService');
const weatherService = require('../services/weatherService');
const bookingService = require('../services/bookingService');
const { CalendarIntegration, SocialMediaIntegration, ApiKeys } = require('../models/Integrations');

// Calendar Integration Routes
router.post('/calendar/connect/google',
    protect,
    [
        body('authCode').notEmpty().withMessage('Authorization code is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await calendarService.connectGoogleCalendar(req.user.id, req.body.authCode);
            res.json(result);
        } catch (error) {
            console.error('Connect Google Calendar error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/calendar/connect/outlook',
    protect,
    [
        body('accessToken').notEmpty().withMessage('Access token is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await calendarService.connectOutlookCalendar(req.user.id, req.body.accessToken);
            res.json(result);
        } catch (error) {
            console.error('Connect Outlook Calendar error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/calendar/events/trip',
    protect,
    [
        body('destination').notEmpty().withMessage('Destination is required'),
        body('startDate').isISO8601().withMessage('Valid start date is required'),
        body('endDate').isISO8601().withMessage('Valid end date is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tripData = {
                destination: req.body.destination,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
                description: req.body.description,
                blogId: req.body.blogId,
                tripId: req.body.tripId
            };

            const result = await calendarService.createTripEvent(req.user.id, tripData);
            res.json(result);
        } catch (error) {
            console.error('Create trip event error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/calendar/events/flight',
    protect,
    [
        body('flightNumber').notEmpty().withMessage('Flight number is required'),
        body('departure.time').isISO8601().withMessage('Valid departure time is required'),
        body('arrival.time').isISO8601().withMessage('Valid arrival time is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await calendarService.createFlightEvent(req.user.id, req.body);
            res.json(result);
        } catch (error) {
            console.error('Create flight event error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/calendar/sync', protect, async (req, res) => {
    try {
        const result = await calendarService.syncCalendarEvents(req.user.id);
        res.json(result);
    } catch (error) {
        console.error('Sync calendar error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/calendar/export/:format?', protect, async (req, res) => {
    try {
        const format = req.params.format || 'ics';
        const calendar = await calendarService.exportTravelCalendar(req.user.id, format);
        
        if (format === 'ics') {
            res.set({
                'Content-Type': 'text/calendar',
                'Content-Disposition': 'attachment; filename="travel-calendar.ics"'
            });
        } else {
            res.set('Content-Type', 'application/json');
        }
        
        res.send(calendar);
    } catch (error) {
        console.error('Export calendar error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/calendar/integrations', protect, async (req, res) => {
    try {
        const integrations = await CalendarIntegration.find({ 
            user: req.user.id 
        }).select('-accessToken -refreshToken');
        
        res.json(integrations);
    } catch (error) {
        console.error('Get calendar integrations error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/calendar/integrations/:provider', protect, async (req, res) => {
    try {
        const result = await calendarService.deleteIntegration(req.user.id, req.params.provider);
        res.json(result);
    } catch (error) {
        console.error('Delete calendar integration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Social Media Integration Routes
router.post('/social/connect/:platform',
    protect,
    [
        body('accessToken').notEmpty().withMessage('Access token is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { platform } = req.params;
            const { accessToken, refreshToken, expiresAt, settings } = req.body;
            
            const result = await socialMediaService.connectAccount(
                req.user.id, 
                platform, 
                accessToken, 
                { refreshToken, expiresAt, settings }
            );
            
            res.json(result);
        } catch (error) {
            console.error('Connect social media error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/social/post/auto',
    protect,
    [
        body('blogId').notEmpty().withMessage('Blog ID is required'),
        body('title').notEmpty().withMessage('Title is required'),
        body('content').notEmpty().withMessage('Content is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const blogData = {
                _id: req.body.blogId,
                title: req.body.title,
                content: req.body.content,
                images: req.body.images,
                coverImage: req.body.coverImage,
                location: req.body.location,
                author: { name: req.user.name }
            };

            const result = await socialMediaService.autoPost(req.user.id, blogData);
            res.json(result);
        } catch (error) {
            console.error('Auto post error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/social/post/schedule',
    protect,
    [
        body('platform').notEmpty().withMessage('Platform is required'),
        body('content').notEmpty().withMessage('Content is required'),
        body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { platform, content, scheduledTime } = req.body;
            const result = await socialMediaService.schedulePost(
                req.user.id, 
                platform, 
                content, 
                new Date(scheduledTime)
            );
            
            res.json(result);
        } catch (error) {
            console.error('Schedule post error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/social/analytics/:platform',
    protect,
    [
        query('timeRange').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid time range')
    ],
    async (req, res) => {
        try {
            const { platform } = req.params;
            const { timeRange = '30d' } = req.query;
            
            const analytics = await socialMediaService.getAnalytics(req.user.id, platform, timeRange);
            res.json(analytics);
        } catch (error) {
            console.error('Get social media analytics error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/social/integrations', protect, async (req, res) => {
    try {
        const integrations = await SocialMediaIntegration.find({ 
            user: req.user.id 
        }).select('-accessToken -refreshToken');
        
        res.json(integrations);
    } catch (error) {
        console.error('Get social media integrations error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/social/integrations/:platform', protect, async (req, res) => {
    try {
        const result = await socialMediaService.deleteIntegration(req.user.id, req.params.platform);
        res.json(result);
    } catch (error) {
        console.error('Delete social media integration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Weather Integration Routes
router.get('/weather/current',
    protect,
    [
        query('location').notEmpty().withMessage('Location is required'),
        query('provider').optional().isIn(['openweather', 'weatherapi', 'accuweather'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { location, provider } = req.query;
            const weather = await weatherService.getCurrentWeather(location, provider);
            res.json(weather);
        } catch (error) {
            console.error('Get current weather error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/weather/forecast',
    protect,
    [
        query('location').notEmpty().withMessage('Location is required'),
        query('days').optional().isInt({ min: 1, max: 14 }).withMessage('Days must be between 1 and 14'),
        query('provider').optional().isIn(['openweather', 'weatherapi', 'accuweather'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { location, days = 5, provider } = req.query;
            const forecast = await weatherService.getWeatherForecast(location, parseInt(days), provider);
            res.json(forecast);
        } catch (error) {
            console.error('Get weather forecast error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/weather/alerts',
    protect,
    [
        query('lat').isFloat().withMessage('Valid latitude is required'),
        query('lng').isFloat().withMessage('Valid longitude is required'),
        query('provider').optional().isIn(['openweather', 'weatherapi', 'accuweather'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const coordinates = {
                lat: parseFloat(req.query.lat),
                lng: parseFloat(req.query.lng)
            };
            
            const alerts = await weatherService.getWeatherAlerts(coordinates, req.query.provider);
            res.json(alerts);
        } catch (error) {
            console.error('Get weather alerts error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/weather/travel-insights',
    protect,
    [
        query('destination').notEmpty().withMessage('Destination is required'),
        query('departureDate').isISO8601().withMessage('Valid departure date is required'),
        query('returnDate').isISO8601().withMessage('Valid return date is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { destination, departureDate, returnDate } = req.query;
            const insights = await weatherService.getTravelWeatherInsights(
                destination,
                new Date(departureDate),
                new Date(returnDate)
            );
            
            res.json(insights);
        } catch (error) {
            console.error('Get travel weather insights error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// Booking Integration Routes
router.post('/booking/flights/search',
    protect,
    [
        body('origin.code').notEmpty().withMessage('Origin airport code is required'),
        body('destination.code').notEmpty().withMessage('Destination airport code is required'),
        body('departureDate').isISO8601().withMessage('Valid departure date is required'),
        body('passengers.adults').isInt({ min: 1 }).withMessage('At least 1 adult passenger is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await bookingService.searchFlights(req.user.id, req.body);
            res.json(result);
        } catch (error) {
            console.error('Search flights error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/booking/hotels/search',
    protect,
    [
        body('location.city').notEmpty().withMessage('City is required'),
        body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
        body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
        body('guests.adults').isInt({ min: 1 }).withMessage('At least 1 adult guest is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await bookingService.searchHotels(req.user.id, req.body);
            res.json(result);
        } catch (error) {
            console.error('Search hotels error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/booking/price-track',
    protect,
    [
        body('type').isIn(['flight', 'hotel']).withMessage('Type must be flight or hotel'),
        body('itemId').notEmpty().withMessage('Item ID is required'),
        body('searchId').notEmpty().withMessage('Search ID is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { type, itemId, searchId } = req.body;
            let result;
            
            if (type === 'flight') {
                result = await bookingService.trackFlightPrice(req.user.id, itemId, searchId);
            }
            
            res.json(result);
        } catch (error) {
            console.error('Track price error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.post('/booking/initiate',
    protect,
    [
        body('type').isIn(['flight', 'hotel']).withMessage('Type must be flight or hotel'),
        body('itemId').notEmpty().withMessage('Item ID is required'),
        body('searchId').notEmpty().withMessage('Search ID is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { type, itemId, searchId } = req.body;
            const result = await bookingService.initiateBooking(req.user.id, type, itemId, searchId);
            res.json(result);
        } catch (error) {
            console.error('Initiate booking error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/booking/flights/insights',
    protect,
    [
        query('origin').notEmpty().withMessage('Origin is required'),
        query('destination').notEmpty().withMessage('Destination is required'),
        query('departureDate').isISO8601().withMessage('Valid departure date is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const insights = await bookingService.getFlightInsights(req.query);
            res.json(insights);
        } catch (error) {
            console.error('Get flight insights error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// API Keys Management (Admin only)
router.post('/api-keys',
    protect,
    // adminAuth, // Add admin middleware
    [
        body('service').notEmpty().withMessage('Service is required'),
        body('keys.primary').notEmpty().withMessage('Primary key is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const apiKeys = new ApiKeys(req.body);
            await apiKeys.save();
            
            res.status(201).json({ 
                success: true, 
                service: apiKeys.service,
                isActive: apiKeys.isActive 
            });
        } catch (error) {
            console.error('Create API keys error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/api-keys', protect, async (req, res) => {
    try {
        const apiKeys = await ApiKeys.find({ isActive: true })
            .select('service isActive usage.requestCount usage.lastRequest');
        
        res.json(apiKeys);
    } catch (error) {
        console.error('Get API keys error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check for integrations
router.get('/health', async (req, res) => {
    try {
        const services = {
            calendar: true,
            socialMedia: true,
            weather: !!process.env.OPENWEATHER_API_KEY,
            booking: true
        };

        const overallHealth = Object.values(services).every(status => status);

        res.json({
            status: overallHealth ? 'healthy' : 'degraded',
            services,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Integration health check error:', error);
        res.status(500).json({ 
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
