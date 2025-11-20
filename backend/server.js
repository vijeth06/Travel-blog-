require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const logger = require('./utils/logger');
const { optimizeConnection, createIndexes } = require('./utils/dbOptimizations');
const { globalErrorHandler } = require('./utils/errorHandler');

// Connect to MongoDB with optimizations
const connectDB = async () => {
  try {
    const connectionOptions = optimizeConnection();
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/travel-blog';
    await mongoose.connect(mongoUri, connectionOptions);
    logger.info('MongoDB connected successfully');
    
    // Create database indexes for better performance
    await createIndexes();
  } catch (error) {
    logger.error('MongoDB connection error:', { error: error.message });
    logger.info('Server will continue without database connection');
    // Don't exit - let server continue for API testing
    
    // Set a flag to indicate DB is not available
    global.dbAvailable = false;
    return;
  }
  
  global.dbAvailable = true;
};

connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to controllers
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
    
    // Send unread notification count
    socket.emit('notification-count', { unreadCount: 0 }); // TODO: implement actual count
  });

  // Join blog room for real-time comments
  socket.on('join-blog', (blogId) => {
    socket.join(`blog-${blogId}`);
    console.log(`User joined blog room: ${blogId}`);
  });

  // Leave blog room
  socket.on('leave-blog', (blogId) => {
    socket.leave(`blog-${blogId}`);
    console.log(`User left blog room: ${blogId}`);
  });

  // Handle new comment
  socket.on('new-comment', (data) => {
    // Broadcast to all users in the blog room
    socket.to(`blog-${data.blogId}`).emit('comment-added', data);
    
    // Send notification to blog author if different from commenter
    if (data.blogAuthorId && data.blogAuthorId !== data.userId) {
      io.to(`user-${data.blogAuthorId}`).emit('new-notification', {
        type: 'comment',
        message: `${data.userName} commented on your blog`,
        blogId: data.blogId,
        blogTitle: data.blogTitle,
        timestamp: new Date()
      });
    }
  });

  // Handle new like
  socket.on('new-like', (data) => {
    // Broadcast like update to blog room
    socket.to(`blog-${data.targetId}`).emit('like-updated', data);
    
    // Send notification to content owner
    if (data.authorId && data.authorId !== data.userId) {
      io.to(`user-${data.authorId}`).emit('new-notification', {
        type: 'like',
        message: `${data.userName} liked your ${data.targetType.toLowerCase()}`,
        targetId: data.targetId,
        targetType: data.targetType,
        timestamp: new Date()
      });
    }
  });

  // Handle follow actions
  socket.on('follow-action', (data) => {
    // Notify the user being followed
    io.to(`user-${data.followedUserId}`).emit('follow-updated', data);
    
    if (data.following) {
      io.to(`user-${data.followedUserId}`).emit('new-notification', {
        type: 'follow',
        message: `${data.followerName} started following you`,
        followerId: data.followerId,
        timestamp: new Date()
      });
    }
  });

  // Handle content sharing
  socket.on('content-shared', (data) => {
    // Track sharing analytics
    console.log(`Content shared: ${data.targetType} ${data.targetId} on ${data.platform}`);
  });

  // Handle typing indicators for comments
  socket.on('typing-comment', (data) => {
    socket.to(`blog-${data.blogId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      blogId: data.blogId
    });
  });

  socket.on('stop-typing-comment', (data) => {
    socket.to(`blog-${data.blogId}`).emit('user-stop-typing', {
      userId: data.userId,
      blogId: data.blogId
    });
  });

  // Handle online status
  socket.on('user-online', (userId) => {
    socket.join('online-users');
    socket.broadcast.emit('user-status-change', {
      userId,
      status: 'online'
    });
  });

  // Handle booking updates
  socket.on('booking-update', (data) => {
    io.to(`user-${data.userId}`).emit('booking-status-changed', data);
    
    // Send notification for booking status changes
    io.to(`user-${data.userId}`).emit('new-notification', {
      type: 'booking',
      message: `Your booking status changed to ${data.status}`,
      bookingId: data.bookingId,
      timestamp: new Date()
    });
  });

  // Handle cart updates
  socket.on('cart-update', (data) => {
    io.to(`user-${data.userId}`).emit('cart-updated', data);
  });

  // Handle live location sharing (for travel buddies)
  socket.on('share-location', (data) => {
    socket.to(`user-${data.recipientId}`).emit('location-shared', {
      from: data.userId,
      location: data.location,
      message: data.message,
      timestamp: new Date()
    });
  });

  // Handle gamification events
  socket.on('achievement-unlocked', (data) => {
    io.to(`user-${data.userId}`).emit('new-notification', {
      type: 'achievement',
      message: `🏆 Achievement unlocked: ${data.achievementName}`,
      achievement: data.achievement,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Update user status to offline
    socket.broadcast.emit('user-status-change', {
      socketId: socket.id,
      status: 'offline'
    });
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Travel Blog API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handlers
app.use(globalErrorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', { error: err.message, stack: err.stack });
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Socket.IO server running on port ${PORT}`);
});
