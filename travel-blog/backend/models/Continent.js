const mongoose = require('mongoose');

const ContinentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // AS, EU, NA, SA, AF, OC, AN
  
  // Basic information
  description: { type: String, required: true },
  shortDescription: { type: String },
  
  // Geographic information
  area: { type: Number }, // in square kilometers
  population: { type: Number },
  countries: [{ type: String }], // Array of country names
  
  // Famous tourist places
  famousPlaces: [{
    name: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Natural Wonder', 'Historical Site', 'Cultural Site', 'Adventure', 'Beach', 'Mountain', 'City', 'Religious Site', 'Wildlife', 'Architecture'],
      required: true 
    },
    images: [{
      url: { type: String, required: true },
      caption: { type: String },
      alt: { type: String },
      photographer: { type: String },
      source: { type: String }
    }],
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    bestTimeToVisit: { type: String },
    averageStay: { type: String }, // "2-3 days", "1 week", etc.
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Moderate', 'Challenging', 'Expert'],
      default: 'Easy'
    },
    entryFee: {
      amount: { type: Number },
      currency: { type: String },
      notes: { type: String }
    },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    popularity: { type: Number, default: 0 }
  }],
  
  // Travel information
  bestTimeToVisit: { type: String },
  averageTemperature: {
    summer: { type: String },
    winter: { type: String }
  },
  majorLanguages: [{ type: String }],
  majorCurrencies: [{ type: String }],
  
  // Travel tips
  travelTips: [{ type: String }],
  culturalTips: [{ type: String }],
  safetyTips: [{ type: String }],
  
  // Media
  heroImage: {
    url: { type: String },
    caption: { type: String },
    alt: { type: String }
  },
  gallery: [{
    url: { type: String },
    caption: { type: String },
    alt: { type: String },
    category: { type: String } // landscape, culture, food, etc.
  }],
  
  // Statistics
  blogsCount: { type: Number, default: 0 },
  packagesCount: { type: Number, default: 0 },
  touristPlacesCount: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  
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
ContinentSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Update tourist places count
  this.touristPlacesCount = this.famousPlaces ? this.famousPlaces.length : 0;
  
  this.updatedAt = Date.now();
  next();
});

// Index for search
ContinentSchema.index({ name: 'text', description: 'text', 'famousPlaces.name': 'text' });
ContinentSchema.index({ featured: 1, popularity: -1 });
ContinentSchema.index({ 'famousPlaces.featured': 1 });
ContinentSchema.index({ 'famousPlaces.category': 1 });

module.exports = mongoose.model('Continent', ContinentSchema);