const mongoose = require('mongoose');

const TripPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  destination: {
    name: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  tripDetails: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number }, // in days
    budget: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' }
    },
    travelers: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 }
    },
    travelStyle: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'backpacking', 'family', 'romantic', 'adventure', 'cultural']
    }
  },
  
  preferences: {
    interests: [{ type: String }], // ['culture', 'food', 'adventure', 'nature', 'nightlife']
    accommodation: {
      type: String,
      enum: ['hotel', 'hostel', 'apartment', 'resort', 'any']
    },
    transportation: [{ type: String }], // ['flight', 'train', 'bus', 'car']
    activities: [{ type: String }]
  },
  
  aiGenerated: {
    isAiGenerated: { type: Boolean, default: false },
    confidence: { type: Number }, // AI confidence score 0-1
    model: { type: String }, // AI model used
    generatedAt: { type: Date }
  },
  
  itinerary: [{
    day: { type: Number, required: true },
    date: { type: Date },
    location: {
      name: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    activities: [{
      time: { type: String }, // "09:00"
      title: { type: String, required: true },
      description: { type: String },
      duration: { type: Number }, // in minutes
      cost: {
        amount: { type: Number },
        currency: { type: String, default: 'USD' }
      },
      category: {
        type: String,
        enum: ['sightseeing', 'food', 'transport', 'accommodation', 'activity', 'shopping']
      },
      bookingRequired: { type: Boolean, default: false },
      bookingUrl: { type: String }
    }]
  }],
  
  estimatedCosts: {
    accommodation: { type: Number },
    food: { type: Number },
    transportation: { type: Number },
    activities: { type: Number },
    total: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  
  recommendations: {
    restaurants: [{
      name: { type: String },
      cuisine: { type: String },
      priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'] },
      rating: { type: Number },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }],
    attractions: [{
      name: { type: String },
      type: { type: String },
      description: { type: String },
      rating: { type: Number },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }],
    accommodations: [{
      name: { type: String },
      type: { type: String, enum: ['hotel', 'hostel', 'apartment', 'resort'] },
      priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'] },
      rating: { type: Number },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }]
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  sharing: {
    isPublic: { type: Boolean, default: false },
    shareCode: { type: String, unique: true, sparse: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    wouldRecommend: { type: Boolean }
  }
}, {
  timestamps: true
});

// Index for efficient querying
TripPlanSchema.index({ user: 1, createdAt: -1 });
TripPlanSchema.index({ 'destination.country': 1 });
TripPlanSchema.index({ status: 1 });
TripPlanSchema.index({ shareCode: 1 });

// Pre-save middleware to generate share code
TripPlanSchema.pre('save', function(next) {
  if (this.sharing.isPublic && !this.shareCode) {
    this.sharing.shareCode = Math.random().toString(36).substring(2, 15);
  }
  next();
});

module.exports = mongoose.model('TripPlan', TripPlanSchema);