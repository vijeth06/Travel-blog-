const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // ISO 3166-1 alpha-2 code
  continent: { type: String, required: true },
  region: { type: String }, // South Asia, Southeast Asia, etc.
  isIndia: { type: Boolean, default: false },
  
  // Currency information
  currency: {
    code: { type: String, required: true }, // USD, INR, EUR, etc.
    name: { type: String, required: true }, // US Dollar, Indian Rupee, etc.
    symbol: { type: String, required: true }, // $, ₹, €, etc.
    symbolPosition: { type: String, enum: ['before', 'after'], default: 'before' }
  },
  
  // Geographic information
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  
  // Travel information
  capital: { type: String },
  languages: [{ type: String }],
  timezone: { type: String },
  
  // Travel blog related
  description: { type: String },
  popularDestinations: [{ type: String }],
  bestTimeToVisit: { type: String },
  travelTips: [{ type: String }],
  
  // Media
  flagUrl: { type: String },
  images: [{
    url: { type: String },
    caption: { type: String },
    alt: { type: String }
  }],
  
  // Statistics
  blogsCount: { type: Number, default: 0 },
  packagesCount: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 }, // Based on views, blogs, packages
  
  // SEO
  slug: { type: String, unique: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  
  // Status
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate slug from name
CountrySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  this.updatedAt = Date.now();
  next();
});

// Index for search
CountrySchema.index({ name: 'text', description: 'text', popularDestinations: 'text' });
CountrySchema.index({ continent: 1, region: 1 });
CountrySchema.index({ isIndia: 1 });
CountrySchema.index({ featured: 1, popularity: -1 });

module.exports = mongoose.model('Country', CountrySchema);