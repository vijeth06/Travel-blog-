const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['blog', 'package', 'destination', 'user', 'activity'],
    required: true
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel'
  },
  
  targetModel: {
    type: String,
    required: true,
    enum: ['Blog', 'Package', 'Country', 'User', 'TripPlan']
  },
  
  reason: {
    type: String,
    enum: [
      'similar_interests',
      'location_based',
      'trending',
      'friends_activity',
      'price_range',
      'seasonal',
      'ai_generated',
      'popular_among_similar_users',
      'recently_viewed',
      'wishlist_similar'
    ],
    required: true
  },
  
  score: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  
  metadata: {
    confidence: { type: Number }, // AI confidence
    factors: [{ type: String }], // ['budget_match', 'interest_overlap', 'location_proximity']
    aiModel: { type: String },
    generatedAt: { type: Date, default: Date.now }
  },
  
  userInteraction: {
    viewed: { type: Boolean, default: false },
    clicked: { type: Boolean, default: false },
    liked: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false },
    viewedAt: { type: Date },
    clickedAt: { type: Date },
    interactionScore: { type: Number, default: 0 }
  },
  
  contextualInfo: {
    userLocation: {
      country: { type: String },
      city: { type: String }
    },
    seasonality: { type: String },
    trending: { type: Boolean, default: false },
    personalizedReason: { type: String } // "Because you liked similar cultural experiences"
  },
  
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

// Index for efficient querying
RecommendationSchema.index({ user: 1, score: -1 });
RecommendationSchema.index({ user: 1, type: 1, score: -1 });
RecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RecommendationSchema.index({ targetId: 1, targetModel: 1 });

module.exports = mongoose.model('Recommendation', RecommendationSchema);