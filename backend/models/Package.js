const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: {
    code: { type: String, default: 'USD' },
    symbol: { type: String, default: '$' },
    name: { type: String, default: 'US Dollar' }
  },
  duration: { type: String, required: true }, // e.g., "3 days 2 nights"
  location: {
    name: { type: String, required: true },
    country: { type: String },
    countryCode: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  type: { type: String, enum: ['Single', 'Family', 'Couple'], required: true },
  images: [{ type: String }],
  features: [{ type: String }], // e.g., ["Hotel included", "Meals included", "Transport"]
  itinerary: [{
    day: { type: Number },
    title: { type: String },
    description: { type: String },
    activities: [{ type: String }]
  }],
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  hotel: {
    name: { type: String },
    rating: { type: Number },
    amenities: [{ type: String }]
  },
  availability: { type: Boolean, default: true },
  maxCapacity: { type: Number, default: 10 },
  currentBookings: { type: Number, default: 0 },
  discount: {
    percentage: { type: Number, default: 0 },
    validUntil: { type: Date },
    conditions: { type: String }
  },
  keywords: [{ type: String }], // for search functionality
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
PackageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average rating
PackageSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating.average = sum / this.reviews.length;
    this.rating.count = this.reviews.length;
  }
};

module.exports = mongoose.model('Package', PackageSchema);
