const mongoose = require('mongoose');

const FavoritePlaceSchema = new mongoose.Schema({
  // User who added this favorite place
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Place information
  placeName: {
    type: String,
    required: true,
    trim: true
  },
  
  continent: {
    type: String,
    required: true,
    enum: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Antarctica']
  },
  
  country: {
    type: String,
    required: true,
    trim: true
  },
  
  city: {
    type: String,
    trim: true
  },
  
  // User's personal description and experience
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // User's personal rating
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  
  // When user visited
  visitDate: {
    type: Date
  },
  
  // Duration of stay
  stayDuration: {
    type: String // "2 days", "1 week", etc.
  },
  
  // User's travel tips
  personalTips: [{
    type: String,
    maxlength: 500
  }],
  
  // Categories/tags
  categories: [{
    type: String,
    enum: ['Natural Wonder', 'Historical Site', 'Cultural Site', 'Adventure', 'Beach', 'Mountain', 'City', 'Religious Site', 'Wildlife', 'Architecture', 'Food', 'Nightlife', 'Shopping', 'Family Friendly']
  }],
  
  // Images uploaded by user
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: 200
    },
    alt: {
      type: String,
      maxlength: 100
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  // Location coordinates
  coordinates: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  
  // Best time to visit according to user
  bestTimeToVisit: {
    type: String,
    maxlength: 200
  },
  
  // Budget information
  budget: {
    amount: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    notes: {
      type: String,
      maxlength: 300
    }
  },
  
  // Social interactions
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statistics
  viewsCount: {
    type: Number,
    default: 0
  },
  
  likesCount: {
    type: Number,
    default: 0
  },
  
  commentsCount: {
    type: Number,
    default: 0
  },
  
  // Status
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  // SEO
  slug: {
    type: String,
    unique: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug from place name and user
FavoritePlaceSchema.pre('save', function(next) {
  if (this.isModified('placeName') || !this.slug) {
    const baseSlug = this.placeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add user ID to make it unique
    this.slug = `${baseSlug}-${this.user.toString().slice(-6)}`;
  }
  
  // Update counts
  this.likesCount = this.likes ? this.likes.length : 0;
  this.commentsCount = this.comments ? this.comments.length : 0;
  
  this.updatedAt = Date.now();
  next();
});

// Indexes for better performance
FavoritePlaceSchema.index({ user: 1, continent: 1 });
FavoritePlaceSchema.index({ continent: 1, country: 1 });
FavoritePlaceSchema.index({ placeName: 'text', description: 'text' });
FavoritePlaceSchema.index({ featured: 1, likesCount: -1 });
FavoritePlaceSchema.index({ createdAt: -1 });
FavoritePlaceSchema.index({ isPublic: 1, isActive: 1 });
FavoritePlaceSchema.index({ slug: 1 });

// Virtual for main image
FavoritePlaceSchema.virtual('mainImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  
  const mainImage = this.images.find(img => img.isMain);
  return mainImage || this.images[0];
});

// Virtual for like status by user
FavoritePlaceSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to add like
FavoritePlaceSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push({ user: userId });
    this.likesCount = this.likes.length;
  }
};

// Method to remove like
FavoritePlaceSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  this.likesCount = this.likes.length;
};

// Method to add comment
FavoritePlaceSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  this.commentsCount = this.comments.length;
};

module.exports = mongoose.model('FavoritePlace', FavoritePlaceSchema);