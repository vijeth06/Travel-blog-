const mongoose = require('mongoose');

// Database connection optimization
const optimizeConnection = () => {
  // Connection pooling
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected with optimizations');
  });

  // Set up connection pool options
  const connectionOptions = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    // Note: bufferMaxEntries and bufferCommands are deprecated/unsupported in modern drivers
  };

  return connectionOptions;
};

// Index creation for better query performance
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Blog indexes
    await db.collection('blogs').createIndex({ title: 'text', content: 'text', tags: 'text' });
    await db.collection('blogs').createIndex({ author: 1, status: 1 });
    await db.collection('blogs').createIndex({ category: 1, status: 1 });
    await db.collection('blogs').createIndex({ featured: 1, status: 1 });
    await db.collection('blogs').createIndex({ createdAt: -1 });
    await db.collection('blogs').createIndex({ views: -1 });
    await db.collection('blogs').createIndex({ likesCount: -1 });
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isActive: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    
    // Comment indexes
    await db.collection('comments').createIndex({ blog: 1, status: 1 });
    await db.collection('comments').createIndex({ user: 1 });
    await db.collection('comments').createIndex({ status: 1 });
    await db.collection('comments').createIndex({ createdAt: -1 });
    
    // Package indexes
    await db.collection('packages').createIndex({ title: 'text', description: 'text' });
    await db.collection('packages').createIndex({ category: 1, status: 1 });
    await db.collection('packages').createIndex({ price: 1 });
    await db.collection('packages').createIndex({ rating: -1 });
    await db.collection('packages').createIndex({ featured: 1 });
    
    // Booking indexes
    await db.collection('bookings').createIndex({ user: 1, status: 1 });
    await db.collection('bookings').createIndex({ package: 1 });
    await db.collection('bookings').createIndex({ status: 1 });
    await db.collection('bookings').createIndex({ createdAt: -1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

// Aggregation pipeline optimizations
const optimizedAggregations = {
  // Get popular blogs with author info
  getPopularBlogs: (limit = 10) => [
    { $match: { status: 'published' } },
    { $sort: { views: -1, likesCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { name: 1, avatar: 1 } }]
      }
    },
    { $unwind: '$author' },
    {
      $project: {
        title: 1,
        excerpt: 1,
        featuredImage: 1,
        author: 1,
        views: 1,
        likesCount: 1,
        createdAt: 1
      }
    }
  ],

  // Get user statistics
  getUserStats: (userId) => [
    { $match: { _id: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'blogs',
        localField: '_id',
        foreignField: 'author',
        as: 'blogs'
      }
    },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'user',
        as: 'comments'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        avatar: 1,
        totalBlogs: { $size: '$blogs' },
        totalComments: { $size: '$comments' },
        totalViews: { $sum: '$blogs.views' },
        totalLikes: { $sum: '$blogs.likesCount' }
      }
    }
  ],

  // Get analytics data
  getAnalyticsData: () => [
    {
      $facet: {
        userStats: [
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ],
        blogStats: [
          {
            $lookup: {
              from: 'blogs',
              pipeline: [
                { $group: { _id: '$status', count: { $sum: 1 } } }
              ],
              as: 'blogStats'
            }
          }
        ],
        commentStats: [
          {
            $lookup: {
              from: 'comments',
              pipeline: [
                { $group: { _id: '$status', count: { $sum: 1 } } }
              ],
              as: 'commentStats'
            }
          }
        ]
      }
    }
  ]
};

module.exports = {
  optimizeConnection,
  createIndexes,
  optimizedAggregations
};
