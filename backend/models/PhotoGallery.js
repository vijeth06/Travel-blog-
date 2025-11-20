const mongoose = require('mongoose');

const PhotoGallerySchema = new mongoose.Schema({
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
  photos: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String,
    takenAt: Date,
    location: {
      name: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: [Number]
      }
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  coverPhoto: {
    type: String
  },
  tags: [String],
  destination: String,
  country: String,
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'public'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
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
PhotoGallerySchema.index({ 'photos.location.coordinates': '2dsphere' });

// Index for search
PhotoGallerySchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for photo count
PhotoGallerySchema.virtual('photoCount').get(function() {
  return this.photos.length;
});

// Virtual for like count
PhotoGallerySchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Update timestamp on save
PhotoGallerySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PhotoGallery', PhotoGallerySchema);
