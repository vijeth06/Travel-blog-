const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // Who wrote the review
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // What is being reviewed
  targetType: {
    type: String,
    required: true,
    enum: ['destination', 'hotel', 'restaurant', 'activity', 'package', 'blog', 'guide']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },

  // Review content
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Ratings (1-5 scale)
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Detailed ratings for different aspects
  aspectRatings: {
    value: { type: Number, min: 1, max: 5 }, // Value for money
    service: { type: Number, min: 1, max: 5 }, // Service quality
    cleanliness: { type: Number, min: 1, max: 5 }, // Cleanliness
    location: { type: Number, min: 1, max: 5 }, // Location/accessibility
    facilities: { type: Number, min: 1, max: 5 }, // Facilities/amenities
    food: { type: Number, min: 1, max: 5 }, // Food quality (for restaurants/hotels)
    atmosphere: { type: Number, min: 1, max: 5 }, // Atmosphere/ambiance
    safety: { type: Number, min: 1, max: 5 } // Safety
  },

  // Media attachments
  images: [{
    url: String,
    caption: String,
    isMainImage: { type: Boolean, default: false }
  }],
  
  // Trip context
  tripType: {
    type: String,
    enum: ['solo', 'couple', 'family', 'friends', 'business', 'group']
  },
  visitDate: {
    type: Date,
    required: true
  },
  stayDuration: {
    type: String, // "1 night", "3 days", "1 week", etc.
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['booking_confirmation', 'location_check', 'admin_verified', 'none'],
    default: 'none'
  },

  // Engagement
  helpful: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  notHelpful: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  
  // Responses
  responses: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    date: { type: Date, default: Date.now },
    isBusinessOwner: { type: Boolean, default: false }
  }],

  // Moderation
  status: {
    type: String,
    enum: ['published', 'pending', 'rejected', 'flagged'],
    default: 'published'
  },
  flags: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
    },
    description: String,
    date: { type: Date, default: Date.now }
  }],

  // Analytics
  views: { type: Number, default: 0 },
  
  // Tags and categorization
  tags: [String],
  
  // Pros and cons
  pros: [String],
  cons: [String],
  
  // Recommendations
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  recommendedFor: [{
    type: String,
    enum: ['solo_travelers', 'couples', 'families', 'business_travelers', 'budget_travelers', 'luxury_travelers', 'adventure_seekers', 'relaxation_seekers']
  }],

  // Seasonal information
  bestTimeToVisit: [{
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter']
    },
    months: [String]
  }],

  // Additional context
  traveledWith: {
    type: String,
    enum: ['alone', 'spouse', 'family', 'friends', 'colleagues', 'tour_group']
  },
  
  reasonForVisit: {
    type: String,
    enum: ['leisure', 'business', 'conference', 'wedding', 'anniversary', 'honeymoon', 'family_vacation', 'adventure', 'relaxation']
  }
}, {
  timestamps: true
});

// Indexes
ReviewSchema.index({ targetType: 1, targetId: 1 });
ReviewSchema.index({ author: 1 });
ReviewSchema.index({ overallRating: -1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ isVerified: 1 });

// Compound indexes for common queries
ReviewSchema.index({ targetType: 1, targetId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ author: 1, createdAt: -1 });

// Text search index
ReviewSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Virtual for helpfulness score
ReviewSchema.virtual('helpfulnessScore').get(function() {
  const helpfulCount = this.helpful.length;
  const notHelpfulCount = this.notHelpful.length;
  const totalVotes = helpfulCount + notHelpfulCount;
  
  if (totalVotes === 0) return 0;
  return helpfulCount / totalVotes;
});

// Virtual for average aspect rating
ReviewSchema.virtual('averageAspectRating').get(function() {
  const aspects = this.aspectRatings;
  const validRatings = Object.values(aspects).filter(rating => rating && rating > 0);
  
  if (validRatings.length === 0) return this.overallRating;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
});

// Static methods
ReviewSchema.statics.getAverageRating = async function(targetType, targetId) {
  const result = await this.aggregate([
    {
      $match: {
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId),
        status: 'published'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$overallRating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$overallRating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const stats = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  stats.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(stats.averageRating * 10) / 10,
    totalReviews: stats.totalReviews,
    ratingDistribution: distribution
  };
};

ReviewSchema.statics.getDetailedStats = async function(targetType, targetId) {
  const result = await this.aggregate([
    {
      $match: {
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId),
        status: 'published'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageOverall: { $avg: '$overallRating' },
        averageValue: { $avg: '$aspectRatings.value' },
        averageService: { $avg: '$aspectRatings.service' },
        averageCleanliness: { $avg: '$aspectRatings.cleanliness' },
        averageLocation: { $avg: '$aspectRatings.location' },
        averageFacilities: { $avg: '$aspectRatings.facilities' },
        averageFood: { $avg: '$aspectRatings.food' },
        averageAtmosphere: { $avg: '$aspectRatings.atmosphere' },
        averageSafety: { $avg: '$aspectRatings.safety' },
        recommendPercentage: {
          $avg: {
            $cond: [{ $eq: ['$wouldRecommend', true] }, 1, 0]
          }
        },
        verifiedReviewsCount: {
          $sum: {
            $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
          }
        }
      }
    }
  ]);

  return result[0] || {};
};

// Instance methods
ReviewSchema.methods.markHelpful = function(userId) {
  // Remove from not helpful if exists
  this.notHelpful = this.notHelpful.filter(
    item => item.user.toString() !== userId.toString()
  );
  
  // Add to helpful if not already there
  if (!this.helpful.find(item => item.user.toString() === userId.toString())) {
    this.helpful.push({ user: userId });
  }
  
  return this.save();
};

ReviewSchema.methods.markNotHelpful = function(userId) {
  // Remove from helpful if exists
  this.helpful = this.helpful.filter(
    item => item.user.toString() !== userId.toString()
  );
  
  // Add to not helpful if not already there
  if (!this.notHelpful.find(item => item.user.toString() === userId.toString())) {
    this.notHelpful.push({ user: userId });
  }
  
  return this.save();
};

ReviewSchema.methods.addResponse = function(userId, content, isBusinessOwner = false) {
  this.responses.push({
    author: userId,
    content,
    isBusinessOwner
  });
  
  return this.save();
};

ReviewSchema.methods.flagReview = function(userId, reason, description = '') {
  if (!this.flags.find(flag => flag.user.toString() === userId.toString())) {
    this.flags.push({
      user: userId,
      reason,
      description
    });
    
    // Auto-flag for review if multiple flags
    if (this.flags.length >= 3) {
      this.status = 'flagged';
    }
  }
  
  return this.save();
};

// Pre-save middleware
ReviewSchema.pre('save', function(next) {
  // Calculate overall rating from aspect ratings if not provided
  if (!this.overallRating && this.aspectRatings) {
    const aspects = Object.values(this.aspectRatings).filter(rating => rating && rating > 0);
    if (aspects.length > 0) {
      this.overallRating = Math.round(aspects.reduce((sum, rating) => sum + rating, 0) / aspects.length);
    }
  }
  
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);