const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const compression = require('compression');
const helmet = require('helmet');
const { generalLimiter } = require('./middleware/rateLimiter');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const enhancedAuthRoutes = require('./routes/enhancedAuth');
const blogRoutes = require('./routes/blogs');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const cartRoutes = require('./routes/cart');
const likeRoutes = require('./routes/likes');
const socialRoutes = require('./routes/social');
const userRoutes = require('./routes/users');
const mapRoutes = require('./routes/maps');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/admin');
const countryRoutes = require('./routes/countries');
const continentRoutes = require('./routes/continents');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const favoritePlacesRoutes = require('./routes/favoritePlaces');
const tripPlannerRoutes = require('./routes/tripPlanner');
const recommendationRoutes = require('./routes/recommendations');
const chatbotRoutes = require('./routes/chatbot');
const travelBuddyRoutes = require('./routes/travelBuddies');
// const gamificationRoutes = require('./routes/gamification');
const realGamificationRoutes = require('./routes/realGamification');
const realAIRecommendationRoutes = require('./routes/realAIRecommendations');
const forumRoutes = require('./routes/forum');
const videoBlogRoutes = require('./routes/videoBlogs');
const photo360Routes = require('./routes/photo360');
const monetizationRoutes = require('./routes/monetization');
const analyticsRoutes = require('./routes/analytics');
const timelineRoutes = require('./routes/timeline');
const mobileRoutes = require('./routes/mobile');
const tripBundleRoutes = require('./routes/tripBundles');
const tripRoutes = require('./routes/trips');
const collectionRoutes = require('./routes/collections');
const reactionRoutes = require('./routes/reactions');
const topicFollowRoutes = require('./routes/topicFollows');
const badgeRoutes = require('./routes/badges');
const premiumTemplateRoutes = require('./routes/premiumTemplates');
const exportRoutes = require('./routes/export');
const travelerAnalyticsRoutes = require('./routes/travelerAnalytics');
const creatorAnalyticsRoutes = require('./routes/creatorAnalytics');
// const integrationRoutes = require('./routes/realIntegrations');
// const premiumRoutes = require('./routes/realPremium');
// const realMobileOptimizationRoutes = require('./routes/realMobileOptimization');
const certificationRoutes = require('./routes/realCertification');
const uxRoutes = require('./routes/ux');
const highImpactRoutes = require('./routes/highImpact');
const searchRoutes = require('./routes/search');
const reviewRoutes = require('./routes/reviews');
const followRoutes = require('./routes/followRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const chatRoutes = require('./routes/chat');
const galleryRoutes = require('./routes/gallery');
const itineraryRoutes = require('./routes/itinerary');
const providerRoutes = require('./routes/providers');
const contactRoutes = require('./routes/contact');

const app = express();

// Trust proxy - Required for Render, Heroku, and other cloud platforms
app.set('trust proxy', 1);

// Request logging middleware
app.use(require('./utils/logger').requestLogger());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com", "https://randomuser.me"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:*", "wss://localhost:*", "wss://travel-blog-na4y.onrender.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(generalLimiter);

// CORS configuration - must be before routes
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://travel-blog-na4y.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // Allow same-origin requests in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enhanced Authentication (New System)
app.use('/api/auth/v2', enhancedAuthRoutes);

// Original Authentication (Legacy)
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/continents', continentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorite-places', favoritePlacesRoutes);
app.use('/api/trip-planner', tripPlannerRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/travel-buddies', travelBuddyRoutes);
app.use('/api/gamification', realGamificationRoutes);
app.use('/api/ai-recommendations', realAIRecommendationRoutes);
// app.use('/api/gamification-old', gamificationRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/video-blogs', videoBlogRoutes);
app.use('/api/360-photos', photo360Routes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/trip-bundles', tripBundleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/topic-follows', topicFollowRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/premium-templates', premiumTemplateRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/traveler-analytics', travelerAnalyticsRoutes);
app.use('/api/creator-analytics', creatorAnalyticsRoutes);
// app.use('/api/integrations', integrationRoutes);
// app.use('/api/premium', premiumRoutes);
// app.use('/api/mobile', realMobileOptimizationRoutes);
app.use('/api/ux', uxRoutes);
app.use('/api/high-impact', highImpactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/certificates', certificationRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/itinerary', itineraryRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  // Cache static assets but not HTML
  app.use('/static', express.static(path.join(__dirname, '../frontend/build/static'), {
    maxAge: '1y',
    immutable: true
  }));
  
  // Serve other static files without long cache
  app.use(express.static(path.join(__dirname, '../frontend/build'), {
    maxAge: 0,
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
  
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('Travel Blog API running'));
}

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
