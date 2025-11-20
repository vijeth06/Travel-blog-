# 🌍 Advanced Travel Blogging & Social Platform

A feature-rich MERN stack application combining travel blogging, social networking, gamification, AI recommendations, and comprehensive trip planning. Deployed at: **https://travel-blog-na4y.onrender.com**

## ✨ Core Features

### 🔐 Authentication & User Management
- Email/Password authentication with JWT
- **Google OAuth 2.0** integration
- Enhanced user profiles with travel preferences, bio, location
- Passport & nationality information
- Emergency contact details
- Privacy settings & account management
- Session management with refresh tokens

### 📝 Advanced Blogging System
- Rich text blog creation with image uploads
- **Video blog support** with embedded media
- **360° photo galleries** with interactive viewing
- Location tagging with geospatial search
- Categories & tags for organization
- Draft saving & scheduled publishing
- Blog analytics (views, reads, engagement)
- SEO optimization

### 🤝 Social & Community Features
- **Social feed** with real-time updates (Socket.IO)
- Follow/unfollow users
- Like & comment on blogs
- Share blogs to social media
- **Travel buddy matching** based on preferences
- **Forum discussions** by topics
- User mentions & tagging
- Social profile pages

### 💬 Real-time Communication
- **Live chat system** with Socket.IO
- Direct messaging between users
- Group chat for travel buddies
- **AI-powered chatbot** for travel queries
- Read receipts & typing indicators
- Message notifications
- Chat history & search

### 🎮 Gamification System
- **Points & XP** for user activities
- **Badges & achievements** (Explorer, Storyteller, Social Butterfly, etc.)
- **Leaderboards** (weekly, monthly, all-time)
- **Levels & progression** system
- Challenges & quests
- Rewards for engagement
- **Certifications** for expertise

### 🗺️ Trip Planning & Organization
- **Trip planner** with day-by-day itineraries
- **Collections** to organize blogs by theme
- Save favorite places with notes
- Interactive maps with markers
- Budget tracking for trips
- Packing list generator
- Weather integration
- Time zone converter

### 🤖 AI & Smart Features
- **AI-powered travel recommendations** based on preferences
- Smart search with filters (location, budget, season, activities)
- Content recommendations
- Destination suggestions
- Optimal route planning
- Seasonal travel insights

### 🔔 Notifications & Alerts
- Real-time notifications (Socket.IO)
- Email notifications
- Push notifications (PWA ready)
- Activity alerts (new followers, likes, comments)
- Trip reminders
- Customizable notification preferences

### 💎 Premium & Monetization
- Premium membership tiers
- Exclusive content for premium users
- Ad-free experience
- Advanced analytics
- Priority support
- Sponsored content system
- Affiliate integration

### 📦 Package Booking System
- Browse & search travel packages
- Detailed itineraries with day-wise plans
- **Shopping cart** with multiple packages
- Booking management with traveler details
- Package reviews & ratings
- Price comparison
- Availability calendar
- Payment integration ready

### 👨‍💼 Admin Dashboard
- User management
- Content moderation
- Package management
- Analytics & reports
- System monitoring
- Ban/suspend users
- Featured content management

## 🛠️ Technology Stack

### Backend
- **Node.js** v18+ with Express.js
- **MongoDB Atlas** with Mongoose ODM (geospatial indexing)
- **Socket.IO** for real-time features
- **JWT** & OAuth 2.0 for authentication
- **bcryptjs** for password hashing
- **Passport.js** for OAuth strategies
- **Multer** for file uploads
- **Cloudinary** for image/video storage
- **Express Rate Limit** for API protection
- **Express Validator** for input validation
- **Winston** for logging
- **Helmet** for security headers

### Frontend
- **React 18** with hooks & functional components
- **Material-UI (MUI)** for modern UI
- **Redux Toolkit** for state management
- **React Router v6** for navigation
- **Axios** for API calls
- **Socket.IO Client** for real-time updates
- **Date-fns** for date handling
- **React Leaflet** for maps
- **Progressive Web App (PWA)** ready
- **Service Workers** for offline support

### DevOps & Deployment
- **Render.com** for hosting (single application)
- **MongoDB Atlas** for database
- **Cloudinary** for media CDN
- **GitHub** for version control
- Auto-deployment on push
- Environment-based configuration

## 📁 Project Structure

```
travel-blog/
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── cloudinary.js            # Media storage
│   │   └── passport.js              # OAuth strategies
│   ├── controllers/                 # 40+ controllers
│   │   ├── authController.js        # Email/password auth
│   │   ├── enhancedAuthController.js # OAuth & advanced auth
│   │   ├── blogController.js        # Blog CRUD
│   │   ├── videoBlogController.js   # Video content
│   │   ├── photo360Controller.js    # 360° galleries
│   │   ├── socialController.js      # Social features
│   │   ├── socialFeedController.js  # Real-time feed
│   │   ├── chatController.js        # Real-time chat
│   │   ├── chatbotController.js     # AI chatbot
│   │   ├── gamificationController.js # Points & badges
│   │   ├── realGamificationController.js # Advanced gamification
│   │   ├── followController.js      # Follow system
│   │   ├── likeController.js        # Likes
│   │   ├── commentController.js     # Comments
│   │   ├── notificationController.js # Notifications
│   │   ├── tripPlannerController.js # Trip planning
│   │   ├── itineraryController.js   # Itineraries
│   │   ├── favoritePlaceController.js # Saved places
│   │   ├── recommendationController.js # AI recommendations
│   │   ├── realAIRecommendationController.js # Advanced AI
│   │   ├── travelBuddyController.js # Buddy matching
│   │   ├── forumController.js       # Forum discussions
│   │   ├── packageController.js     # Travel packages
│   │   ├── bookingController.js     # Bookings
│   │   ├── cartController.js        # Shopping cart
│   │   ├── reviewController.js      # Reviews & ratings
│   │   ├── searchController.js      # Advanced search
│   │   ├── mapController.js         # Geospatial features
│   │   ├── galleryController.js     # Photo galleries
│   │   ├── realPremiumController.js # Premium features
│   │   ├── monetizationController.js # Monetization
│   │   ├── realCertificationController.js # User certifications
│   │   ├── adminController.js       # Admin panel
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── adminAuth.js             # Admin authorization
│   │   ├── errorHandler.js          # Error handling
│   │   └── rateLimiter.js           # Rate limiting
│   ├── models/                      # 30+ Mongoose models
│   │   ├── User.js, Blog.js, Category.js
│   │   ├── Trip.js, Collection.js, Review.js
│   │   ├── Conversation.js, Message.js
│   │   ├── Package.js, Booking.js, Cart.js
│   │   ├── Notification.js, Badge.js
│   │   └── ...
│   ├── routes/                      # API routes
│   ├── services/                    # Business logic
│   ├── utils/                       # Helper functions
│   ├── uploads/                     # Local file storage
│   ├── app.js                       # Express app setup
│   └── server.js                    # Server entry point
├── frontend/
│   ├── public/
│   │   ├── index.html               # PWA ready
│   │   ├── manifest.json            # App manifest
│   │   ├── service-worker.js        # Offline support
│   │   └── icons/                   # PWA icons
│   ├── src/
│   │   ├── api/                     # API service layer (15+ files)
│   │   ├── components/              # Reusable components
│   │   │   ├── BlogCard.jsx
│   │   │   ├── GoogleAuthButton.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── ...
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── SocialFeedPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── TripPlannerPage.jsx
│   │   │   ├── Packages.jsx
│   │   │   └── ...
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/
│   │   │   ├── blogs/
│   │   │   ├── comments/
│   │   │   └── ...
│   │   ├── redux/                   # State management
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   └── ...
│   │   ├── config/
│   │   │   └── api.js               # Centralized API config
│   │   ├── services/
│   │   │   ├── socket.js            # Socket.IO client
│   │   │   └── api.js               # Axios instance
│   │   ├── styles/                  # CSS files
│   │   └── App.js                   # Root component
│   └── package.json
├── .env.example                     # Environment template
├── DEPLOYMENT.md                    # Deployment guide
├── GOOGLE_OAUTH_SETUP.md           # OAuth setup guide
└── README.md
```

## 🚀 Quick Start

### Live Demo
**Production:** https://travel-blog-na4y.onrender.com

**Demo Credentials:**
- Email: `demo@travelapp.com`
- Password: `Demo@123`

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Google Cloud Console account (for OAuth - optional)

### Backend Setup

1. **Clone and navigate:**
   ```bash
   git clone https://github.com/vijeth06/Travel-blog-.git
   cd Travel-blog-/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables** - Create `.env` file:
   ```env
   # MongoDB
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-blog
   
   # Server
   NODE_ENV=development
   PORT=5000
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   SESSION_SECRET=your_session_secret_key_minimum_32_chars
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/v2/google/callback
   
   # Cloudinary (Optional - for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Seed demo data** (optional):
   ```bash
   npm run seed:demo
   ```

5. **Start backend:**
   ```bash
   npm run dev     # Development with nodemon
   npm start       # Production
   ```

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Access application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Production Deployment (Render.com)

See **DEPLOYMENT.md** for complete deployment guide.

**Quick steps:**
1. Push to GitHub
2. Create Render Web Service
3. Add environment variables
4. Deploy automatically on push

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/v2/google` - Google OAuth login
- `GET /api/auth/v2/google/callback` - OAuth callback
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Blogs & Content
- `GET /api/blogs` - Get all blogs (with filters)
- `GET /api/blogs/:id` - Get blog by ID
- `POST /api/blogs` - Create blog (auth required)
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `GET /api/blogs/user/:userId` - Get user's blogs
- `POST /api/blogs/:id/view` - Track blog view
- `GET /api/video-blogs` - Get video blogs
- `GET /api/photo360` - Get 360° galleries

### Social Features
- `GET /api/social/feed` - Get personalized feed
- `POST /api/blogs/:id/like` - Like/unlike blog
- `GET /api/blogs/:id/likes` - Get blog likes
- `POST /api/follow/:userId` - Follow user
- `DELETE /api/follow/:userId` - Unfollow user
- `GET /api/follow/followers` - Get followers
- `GET /api/follow/following` - Get following
- `POST /api/comments` - Add comment
- `GET /api/comments/blog/:blogId` - Get blog comments

### Chat & Messaging
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/:conversationId` - Get conversation messages
- `POST /api/chat/send` - Send message
- `POST /api/chatbot/query` - Ask AI chatbot
- `PUT /api/chat/:messageId/read` - Mark as read

### Gamification
- `GET /api/gamification/profile` - Get user stats
- `GET /api/gamification/badges` - Get user badges
- `GET /api/gamification/leaderboard` - Get leaderboard
- `POST /api/gamification/activity` - Log activity
- `GET /api/certifications` - Get certifications

### Trip Planning
- `GET /api/trips` - Get user trips
- `POST /api/trips` - Create trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `GET /api/collections` - Get collections
- `POST /api/collections` - Create collection
- `GET /api/favorite-places` - Get saved places
- `POST /api/favorite-places` - Save place

### Recommendations & Search
- `GET /api/recommendations` - Get AI recommendations
- `POST /api/search` - Advanced search
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/travel-buddy/matches` - Find travel buddies

### Packages & Bookings
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get package details
- `POST /api/packages` - Create package (admin)
- `GET /api/packages/featured` - Featured packages
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Platform statistics
- `PUT /api/admin/users/:id/ban` - Ban user
- `DELETE /api/admin/content/:id` - Remove content

## 🎯 Key Features Breakdown

### 1. **Complete Social Network**
   - Real-time feed with Socket.IO
   - Follow/unfollow system
   - Likes, comments, shares
   - User profiles & timelines
   - Activity notifications
   - Privacy controls

### 2. **Advanced Content Creation**
   - Rich text blog editor
   - Video blog support
   - 360° photo galleries
   - Draft & schedule posts
   - SEO optimization
   - Content analytics

### 3. **Gamification Engine**
   - Points for all activities
   - 20+ achievement badges
   - Weekly/monthly leaderboards
   - Level progression (1-50)
   - Challenges & quests
   - Certification system

### 4. **AI-Powered Features**
   - Smart travel recommendations
   - Personalized content feed
   - Chatbot for travel queries
   - Destination suggestions
   - Route optimization
   - Budget estimation

### 5. **Real-time Communication**
   - Live chat (Socket.IO)
   - Direct messaging
   - Group chats
   - Read receipts
   - Typing indicators
   - Message search

### 6. **Trip Management**
   - Interactive trip planner
   - Day-by-day itineraries
   - Budget tracking
   - Collections & organization
   - Favorite places
   - Map integration

### 7. **Travel Buddy Matching**
   - Find compatible travelers
   - Match by interests
   - Match by destinations
   - Match by travel dates
   - Compatibility scoring
   - Group formation

### 8. **Premium Features**
   - Subscription tiers
   - Exclusive content
   - Ad-free experience
   - Advanced analytics
   - Priority support
   - Early access features

### 9. **Package Booking System**
   - Complete e-commerce cart
   - Multi-traveler bookings
   - Payment integration ready
   - Booking management
   - Review system
   - Refund handling

### 10. **Admin Dashboard**
   - User management
   - Content moderation
   - Analytics & insights
   - Package management
   - System monitoring
   - Reports generation

## 🔧 Technical Highlights

- **Microservices Architecture** - Modular controller design
- **Geospatial Indexing** - MongoDB 2dsphere for location queries
- **Real-time Updates** - Socket.IO for live features
- **JWT + OAuth 2.0** - Secure authentication
- **Rate Limiting** - DDoS protection with express-rate-limit
- **Input Validation** - Express-validator for security
- **Error Handling** - Centralized error middleware
- **Logging** - Winston for production logs
- **Cache Control** - Optimized static file serving
- **Progressive Web App** - Offline support & installable
- **SEO Optimized** - Meta tags & structured data
- **Mobile Responsive** - Material-UI adaptive design
- **Lazy Loading** - Code splitting for performance
- **Image Optimization** - Cloudinary transformations

## 📊 Database Models (30+)

- User, Blog, Category, Tag
- Trip, Collection, Review
- Package, Booking, Cart
- Conversation, Message
- Notification, Badge, Achievement
- Follow, Like, Comment
- FavoritePlace, PhotoGallery, Itinerary
- Forum, TravelBuddy
- Premium, Subscription, Payment
- Admin, Analytics, Log

## 🌐 Live Demo & Screenshots

**Production URL:** https://travel-blog-na4y.onrender.com

**Test Account:**
- Email: demo@travelapp.com
- Password: Demo@123

**Features to Test:**
1. Google OAuth login
2. Create a blog post
3. Like & comment on posts
4. Chat with other users
5. Plan a trip
6. Browse travel packages
7. Check your gamification stats
8. Find travel buddies

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

**Code Style:**
- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add JSDoc comments for functions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Vijeth** - [GitHub](https://github.com/vijeth06)

## 🙏 Acknowledgments

- Material-UI for beautiful components
- Socket.IO for real-time features
- MongoDB Atlas for database hosting
- Render.com for deployment
- Cloudinary for media storage
- Google OAuth for authentication

## 📞 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/vijeth06/Travel-blog-/issues)
- **Email:** support@travelapp.com
- **Documentation:** See DEPLOYMENT.md and GOOGLE_OAUTH_SETUP.md

## 🔮 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Mobile app (React Native)
- [ ] Flight & hotel booking API integration
- [ ] Multi-language support
- [ ] AR features for destination preview
- [ ] Blockchain-based rewards
- [ ] Machine learning trip recommendations
- [ ] Influencer program
- [ ] Travel insurance integration
- [ ] Carbon footprint tracking

---

**⭐ If you find this project useful, please give it a star!**

**Live Demo:** https://travel-blog-na4y.onrender.com
