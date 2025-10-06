const mongoose = require('mongoose');

const TravelBuddySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  travelProfile: {
    bio: { type: String, maxlength: 500 },
    age: { type: Number, min: 18, max: 100 },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    languages: [{ type: String }], // ['English', 'Spanish', 'French']
    interests: [{ type: String }], // ['Adventure', 'Culture', 'Food', 'Photography']
    travelStyle: {
      type: String,
      enum: ['Budget', 'Mid-range', 'Luxury', 'Backpacking', 'Solo', 'Group']
    },
    smoker: { type: Boolean, default: false },
    drinker: { type: String, enum: ['Never', 'Socially', 'Regularly'] },
    verified: { type: Boolean, default: false }
  },
  
  preferences: {
    lookingFor: {
      type: String,
      enum: ['travel_buddy', 'local_guide', 'roommate', 'activity_partner', 'any'],
      required: true
    },
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 65 }
    },
    genderPreference: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      default: 'Any'
    },
    groupSize: {
      type: String,
      enum: ['2', '3-5', '6-10', '10+'],
      default: '2'
    },
    accommodation: {
      sharedRoom: { type: Boolean, default: true },
      separateRooms: { type: Boolean, default: true }
    }
  },
  
  travelPlans: [{
    destination: {
      country: { type: String, required: true },
      city: { type: String },
      region: { type: String }
    },
    dates: {
      flexible: { type: Boolean, default: true },
      startDate: { type: Date },
      endDate: { type: Date },
      duration: { type: Number } // in days
    },
    budget: {
      amount: { type: Number },
      currency: { type: String, default: 'USD' },
      perDay: { type: Boolean, default: false }
    },
    activities: [{ type: String }],
    status: {
      type: String,
      enum: ['planning', 'confirmed', 'completed', 'cancelled'],
      default: 'planning'
    },
    buddyFound: { type: Boolean, default: false },
    maxBuddies: { type: Number, default: 1 }
  }],
  
  location: {
    current: {
      country: { type: String },
      city: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    searchRadius: { type: Number, default: 100 }, // km
    willingToTravel: { type: Boolean, default: true }
  },
  
  reviews: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, maxlength: 500 },
    trip: {
      destination: { type: String },
      date: { type: Date }
    },
    createdAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
  
  safety: {
    backgroundCheck: { type: Boolean, default: false },
    idVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    socialMediaLinked: { type: Boolean, default: false },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String }
    }
  },
  
  stats: {
    tripsCompleted: { type: Number, default: 0 },
    buddiesHelped: { type: Number, default: 0 },
    countriesVisited: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    responseRate: { type: Number, default: 100 }, // percentage
    lastActive: { type: Date, default: Date.now }
  },
  
  settings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'members_only', 'private'],
      default: 'public'
    },
    contactPreference: {
      type: String,
      enum: ['app_only', 'email', 'phone', 'any'],
      default: 'app_only'
    },
    notifications: {
      newMatches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      tripReminders: { type: Boolean, default: true },
      newsletters: { type: Boolean, default: false }
    }
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for efficient matching
TravelBuddySchema.index({ user: 1 });
TravelBuddySchema.index({ 'preferences.lookingFor': 1 });
TravelBuddySchema.index({ 'travelPlans.destination.country': 1 });
TravelBuddySchema.index({ 'travelPlans.dates.startDate': 1 });
TravelBuddySchema.index({ 'location.current.coordinates': '2dsphere' });
TravelBuddySchema.index({ status: 1, 'stats.lastActive': -1 });

// Pre-save middleware to update stats
TravelBuddySchema.pre('save', function(next) {
  // Calculate average rating
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.stats.averageRating = totalRating / this.reviews.length;
  }
  
  // Update last active
  this.stats.lastActive = new Date();
  
  next();
});

module.exports = mongoose.model('TravelBuddy', TravelBuddySchema);