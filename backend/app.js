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
const mobileRoutes = require('./routes/mobile');
const integrationRoutes = require('./routes/realIntegrations');
const premiumRoutes = require('./routes/realPremium');
const realMobileOptimizationRoutes = require('./routes/realMobileOptimization');
const uxRoutes = require('./routes/ux');
const highImpactRoutes = require('./routes/highImpact');
const searchRoutes = require('./routes/search');
const reviewRoutes = require('./routes/reviews');
const followRoutes = require('./routes/followRoutes');

const app = express();

// Request logging middleware
app.use(require('./utils/logger').requestLogger());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:*", "wss://localhost:*"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(generalLimiter);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
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

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/packages', packageRoutes);
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
app.use('/api/mobile', mobileRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/mobile', realMobileOptimizationRoutes);
app.use('/api/ux', uxRoutes);
app.use('/api/high-impact', highImpactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/follow', followRoutes);

app.get('/', (req, res) => res.send('Travel Blog API running'));

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
