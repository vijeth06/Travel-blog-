const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.social?.google; } }, // Required only if not Google OAuth
  avatar: { type: String },
  role: { type: String, enum: ['visitor', 'author', 'admin'], default: 'visitor' },

  // Travel-specific fields
  passport: { type: String },
  nationality: { type: String },
  country: { type: String },
  city: { type: String },
  address: { type: String },
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },

  // Emergency contact
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },

  // Preferences
  travelPreferences: {
    budgetRange: { type: String, enum: ['Budget', 'Mid-range', 'Luxury'] },
    preferredDestinations: [{ type: String }],
    travelStyle: { type: String, enum: ['Adventure', 'Relaxation', 'Cultural', 'Business'] },
    groupSize: { type: String, enum: ['Solo', 'Couple', 'Family', 'Group'] }
  },

  // Author-specific fields
  bio: { type: String, maxlength: 500 },
  website: { type: String },
  authorVerified: { type: Boolean, default: false },

  // Social features
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  social: {
    google: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    linkedin: { type: String }
  },

  // Favorite locations
  favoriteLocations: [{
    name: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  // Engagement metrics
  totalPosts: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },

  // Account status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password match method
UserSchema.methods.matchPassword = function (enteredPassword) {
  if (!this.password) return false; // Google OAuth users don't have passwords
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
