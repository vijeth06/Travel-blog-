const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, unique: true }, // SEO-friendly URL
  excerpt: { type: String, maxlength: 300 }, // Short description
  content: { type: String, required: true },

  // Media
  images: [{
    url: { type: String },
    caption: { type: String },
    alt: { type: String } // For accessibility
  }],
  videos: [{
    url: { type: String },
    title: { type: String },
    duration: { type: Number } // in seconds
  }],
  featuredImage: { type: String },

  // Location and mapping
  location: { type: String },
  geotag: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    country: { type: String },
    countryCode: { type: String }, // ISO country code
    city: { type: String },
    state: { type: String }, // For Indian states or other regions
    continent: { type: String }
  },

  // Organization
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Publishing
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date },
  scheduledAt: { type: Date },

  // Engagement metrics
  views: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },

  // SEO
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  keywords: [{ type: String }],

  // Reading time estimation
  readingTime: { type: Number }, // in minutes

  // Featured content
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },

  // Comments settings
  commentsEnabled: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate slug from title
BlogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  this.updatedAt = Date.now();
  next();
});

// Method to increment view count
BlogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Blog', BlogSchema);
