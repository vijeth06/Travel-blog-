const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  thumbnail: String,
  caption: {
    type: String,
    maxlength: 500
  },
  duration: {
    type: Number,
    default: 5000 // milliseconds
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    name: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// TTL index - automatically delete expired stories
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for location queries
StorySchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for view count
StorySchema.virtual('viewCount').get(function() {
  return this.views.length;
});

// Method to add view
StorySchema.methods.addView = async function(userId) {
  const hasViewed = this.views.some(v => v.user.toString() === userId.toString());
  
  if (!hasViewed) {
    this.views.push({ user: userId });
    await this.save();
  }
};

module.exports = mongoose.model('Story', StorySchema);
