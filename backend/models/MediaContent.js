const mongoose = require('mongoose');

// Video Blog Schema
const videoBlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  quality: {
    type: String,
    enum: ['720p', '1080p', '4K'],
    default: '1080p'
  },
  size: {
    type: Number, // in bytes
    required: true
  },
  location: {
    name: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    placeId: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  // Enhanced video metadata
  videoMetadata: {
    format: String, // mp4, mov, avi, etc.
    codec: String,
    bitrate: Number,
    fps: Number,
    resolution: {
      width: Number,
      height: Number
    }
  },
  // Social engagement
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // Content settings
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  isMonetized: {
    type: Boolean,
    default: false
  },
  monetization: {
    enabled: Boolean,
    minViewsForAds: {
      type: Number,
      default: 1000
    },
    adPlacements: [{
      type: String,
      enum: ['pre-roll', 'mid-roll', 'post-roll', 'overlay']
    }]
  },
  // Publishing and scheduling
  publishedAt: {
    type: Date,
    default: Date.now
  },
  scheduledAt: Date,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  // Analytics
  analytics: {
    totalViews: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    avgWatchTime: { type: Number, default: 0 }, // in seconds
    completionRate: { type: Number, default: 0 }, // percentage
    engagementRate: { type: Number, default: 0 }, // percentage
    viewsByCountry: [{
      country: String,
      views: Number
    }],
    viewsByDevice: [{
      device: String, // mobile, desktop, tablet
      views: Number
    }]
  },
  // SEO and discovery
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    customUrl: String
  },
  // Related content
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoSeries'
  },
  episodeNumber: Number,
  relatedVideos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoBlog'
  }],
  // Moderation
  moderation: {
    flagged: { type: Boolean, default: false },
    flagReason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Video Series Schema for organizing videos
const videoSeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnailUrl: String,
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoBlog'
  }],
  totalVideos: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// 360° Photo Schema
const photo360Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  location: {
    name: String,
    country: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    altitude: Number,
    placeId: String
  },
  // Photo metadata
  metadata: {
    width: Number,
    height: Number,
    size: Number,
    format: String,
    camera: {
      make: String,
      model: String,
      settings: {
        iso: Number,
        aperture: String,
        shutterSpeed: String,
        focalLength: String
      }
    },
    capturedAt: Date
  },
  // 360 specific properties
  projection: {
    type: String,
    enum: ['equirectangular', 'cubemap', 'cylindrical'],
    default: 'equirectangular'
  },
  fieldOfView: {
    horizontal: { type: Number, default: 360 },
    vertical: { type: Number, default: 180 }
  },
  // Interactive features
  hotspots: [{
    id: String,
    x: Number, // percentage position
    y: Number, // percentage position
    type: {
      type: String,
      enum: ['info', 'link', 'image', 'video', 'audio']
    },
    title: String,
    content: String,
    url: String,
    mediaUrl: String
  }],
  // Social features
  views: { type: Number, default: 0 },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  tags: [String],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  }
}, {
  timestamps: true
});

// AR Location Schema
const arLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String,
    country: String,
    city: String,
    placeId: String
  },
  // AR content
  arContent: {
    type: {
      type: String,
      enum: ['model', 'image', 'video', 'text', 'audio'],
      required: true
    },
    url: String, // URL to 3D model, image, video, etc.
    scale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 1 }
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    }
  },
  // Trigger conditions
  triggers: {
    proximity: {
      enabled: { type: Boolean, default: true },
      radius: { type: Number, default: 50 } // meters
    },
    timeOfDay: {
      enabled: { type: Boolean, default: false },
      startTime: String, // HH:MM format
      endTime: String
    },
    weather: {
      enabled: { type: Boolean, default: false },
      conditions: [String] // sunny, rainy, cloudy, etc.
    }
  },
  // Content metadata
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  duration: Number, // estimated viewing time in minutes
  // Analytics
  interactions: {
    total: { type: Number, default: 0 },
    byDevice: [{
      device: String,
      count: Number
    }],
    byLocation: [{
      country: String,
      count: Number
    }]
  },
  // Social features
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: { type: Number, default: 0 },
  // Publishing
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Interactive Map Feature Schema
const mapFeatureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Geographic data
  geometry: {
    type: {
      type: String,
      enum: ['Point', 'LineString', 'Polygon', 'MultiPoint'],
      required: true
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  // Feature properties
  properties: {
    name: String,
    category: String,
    subcategory: String,
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult', 'expert']
    },
    duration: String, // e.g., "2 hours", "half day"
    bestTime: String, // e.g., "morning", "sunset"
    cost: {
      currency: String,
      amount: Number,
      isFree: Boolean
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    accessibility: {
      wheelchairAccessible: Boolean,
      publicTransport: Boolean,
      parkingAvailable: Boolean
    }
  },
  // Rich media content
  media: {
    photos: [{
      url: String,
      caption: String,
      is360: Boolean
    }],
    videos: [{
      url: String,
      thumbnailUrl: String,
      duration: Number
    }],
    audio: [{
      url: String,
      title: String,
      duration: Number,
      type: String // narration, ambient, music
    }]
  },
  // Interactive elements
  interactions: {
    popup: {
      enabled: Boolean,
      template: String, // HTML template
      data: mongoose.Schema.Types.Mixed
    },
    routing: {
      enabled: Boolean,
      waypoints: [{
        coordinates: [Number],
        name: String,
        description: String
      }]
    },
    layers: [{
      name: String,
      type: String, // heatmap, cluster, choropleth
      data: mongoose.Schema.Types.Mixed,
      style: mongoose.Schema.Types.Mixed
    }]
  },
  // Content organization
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MapCollection'
  }],
  tags: [String],
  // Social features
  views: { type: Number, default: 0 },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // Publishing
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Map Collection Schema for organizing map features
const mapCollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  features: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MapFeature'
  }],
  thumbnailUrl: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [String],
  // Map settings
  defaultView: {
    center: {
      lat: Number,
      lng: Number
    },
    zoom: Number,
    bounds: {
      northeast: {
        lat: Number,
        lng: Number
      },
      southwest: {
        lat: Number,
        lng: Number
      }
    }
  },
  style: {
    theme: String, // light, dark, satellite, terrain
    customStyle: mongoose.Schema.Types.Mixed
  },
  // Social features
  isPublic: { type: Boolean, default: true },
  collaborative: { type: Boolean, default: false },
  contributors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'contributor', 'editor', 'admin']
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for better performance
videoBlogSchema.index({ author: 1, createdAt: -1 });
videoBlogSchema.index({ category: 1, status: 1 });
videoBlogSchema.index({ tags: 1 });
videoBlogSchema.index({ location: '2dsphere' });
videoBlogSchema.index({ 'analytics.totalViews': -1 });

photo360Schema.index({ 'location.coordinates': '2dsphere' });
photo360Schema.index({ author: 1, createdAt: -1 });
photo360Schema.index({ tags: 1 });

arLocationSchema.index({ 'location.coordinates': '2dsphere' });
arLocationSchema.index({ status: 1, visibility: 1 });
arLocationSchema.index({ tags: 1 });

mapFeatureSchema.index({ geometry: '2dsphere' });
mapFeatureSchema.index({ author: 1, status: 1 });
mapFeatureSchema.index({ tags: 1 });

// Virtual fields
videoBlogSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

videoBlogSchema.virtual('commentsCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Create models
const VideoBlog = mongoose.model('VideoBlog', videoBlogSchema);
const VideoSeries = mongoose.model('VideoSeries', videoSeriesSchema);
const Photo360 = mongoose.model('Photo360', photo360Schema);
const ARLocation = mongoose.model('ARLocation', arLocationSchema);
const MapFeature = mongoose.model('MapFeature', mapFeatureSchema);
const MapCollection = mongoose.model('MapCollection', mapCollectionSchema);

module.exports = {
  VideoBlog,
  VideoSeries,
  Photo360,
  ARLocation,
  MapFeature,
  MapCollection
};