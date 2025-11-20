const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  destination: {
    type: String,
    required: true
  },
  country: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: [{
    dayNumber: {
      type: Number,
      required: true
    },
    date: Date,
    title: String,
    activities: [{
      time: String,
      title: {
        type: String,
        required: true
      },
      description: String,
      location: {
        name: String,
        address: String,
        coordinates: {
          type: {
            type: String,
            enum: ['Point']
          },
          coordinates: [Number]
        }
      },
      duration: Number, // in minutes
      cost: {
        amount: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      },
      category: {
        type: String,
        enum: ['accommodation', 'transport', 'food', 'activity', 'sightseeing', 'shopping', 'other']
      },
      bookingRequired: Boolean,
      bookingUrl: String,
      notes: String
    }],
    notes: String
  }],
  budget: {
    total: Number,
    spent: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  travelers: {
    type: Number,
    default: 1
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'private'
  },
  tags: [String],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer'
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for location queries
ItinerarySchema.index({ 'days.activities.location.coordinates': '2dsphere' });

// Text index for search
ItinerarySchema.index({ title: 'text', description: 'text', destination: 'text', tags: 'text' });

// Virtual for duration in days
ItinerarySchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for like count
ItinerarySchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for save count
ItinerarySchema.virtual('saveCount').get(function() {
  return this.saves.length;
});

// Method to calculate total spent
ItinerarySchema.methods.calculateSpent = function() {
  let total = 0;
  this.days.forEach(day => {
    day.activities.forEach(activity => {
      if (activity.cost && activity.cost.amount) {
        total += activity.cost.amount;
      }
    });
  });
  this.budget.spent = total;
  return total;
};

// Update timestamp on save
ItinerarySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);
