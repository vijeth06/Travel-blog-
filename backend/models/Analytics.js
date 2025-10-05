const mongoose = require('mongoose');

// Free analytics using your own database
const AnalyticsSchema = new mongoose.Schema({
  // Page/Content tracking
  type: { 
    type: String, 
    required: true,
    enum: ['page_view', 'blog_view', 'package_view', 'user_action', 'search', 'download']
  },
  
  // What was viewed/interacted with
  targetType: { type: String }, // 'Blog', 'Package', 'Page'
  targetId: { type: mongoose.Schema.Types.ObjectId },
  
  // User information
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for anonymous
  sessionId: { type: String }, // Track anonymous sessions
  
  // Request details
  ipAddress: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  country: { type: String },
  city: { type: String },
  
  // Page/Action details
  path: { type: String }, // URL path
  action: { type: String }, // 'view', 'like', 'share', 'comment', 'search'
  searchQuery: { type: String }, // For search analytics
  
  // Performance metrics
  loadTime: { type: Number }, // Page load time in ms
  timeOnPage: { type: Number }, // Time spent on page in seconds
  
  // Device information
  device: {
    type: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
    browser: { type: String },
    os: { type: String }
  },
  
  // Additional metadata
  metadata: { type: mongoose.Schema.Types.Mixed },
  
  createdAt: { type: Date, default: Date.now }
});

// Travel Timeline Schema
const travelTimelineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  events: [{
    type: {
      type: String,
      enum: ['trip', 'booking', 'activity', 'accommodation', 'flight', 'milestone', 'photo', 'blog_post'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    date: {
      type: Date,
      required: true,
      index: true
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    relatedId: mongoose.Schema.Types.ObjectId, // ID of related blog, booking, etc.
    relatedModel: {
      type: String,
      enum: ['Blog', 'Booking', 'Package', 'MediaContent']
    },
    metadata: {
      duration: Number, // in days
      cost: Number,
      currency: String,
      category: String,
      rating: Number,
      companions: [String],
      weather: String,
      transportation: String
    },
    photos: [{
      url: String,
      thumbnail: String,
      caption: String
    }],
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
  statistics: {
    totalTrips: {
      type: Number,
      default: 0
    },
    totalDays: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    countriesVisited: {
      type: Number,
      default: 0
    },
    citiesVisited: {
      type: Number,
      default: 0
    },
    milesFlown: {
      type: Number,
      default: 0
    },
    topCategories: [{
      category: String,
      count: Number
    }],
    topDestinations: [{
      destination: String,
      count: Number,
      totalDays: Number
    }]
  }
}, {
  timestamps: true
});

// Carbon Footprint Schema
const carbonFootprintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    index: true
  },
  totalEmissions: {
    type: Number,
    default: 0 // kg CO2 equivalent
  },
  breakdown: {
    flights: {
      emissions: {
        type: Number,
        default: 0
      },
      details: [{
        from: String,
        to: String,
        date: Date,
        distance: Number, // km
        emissions: Number, // kg CO2
        flightClass: {
          type: String,
          enum: ['economy', 'business', 'first'],
          default: 'economy'
        },
        airline: String
      }]
    },
    accommodation: {
      emissions: {
        type: Number,
        default: 0
      },
      details: [{
        location: String,
        nights: Number,
        type: {
          type: String,
          enum: ['hotel', 'hostel', 'apartment', 'villa', 'camping']
        },
        emissions: Number,
        energyEfficiency: String
      }]
    },
    localTransport: {
      emissions: {
        type: Number,
        default: 0
      },
      details: [{
        type: {
          type: String,
          enum: ['car', 'bus', 'train', 'taxi', 'metro', 'bicycle', 'walking']
        },
        distance: Number,
        emissions: Number,
        date: Date,
        location: String
      }]
    },
    activities: {
      emissions: {
        type: Number,
        default: 0
      },
      details: [{
        activity: String,
        location: String,
        emissions: Number,
        date: Date,
        participants: Number
      }]
    }
  },
  offsetCredits: {
    purchased: {
      type: Number,
      default: 0
    },
    applied: {
      type: Number,
      default: 0
    },
    projects: [{
      name: String,
      type: String, // reforestation, renewable energy, etc.
      credits: Number,
      cost: Number,
      date: Date,
      certificate: String
    }]
  },
  comparison: {
    previousMonth: Number,
    previousYear: Number,
    averageUser: Number,
    globalAverage: Number
  },
  goals: {
    monthlyTarget: Number,
    yearlyTarget: Number,
    reductionPercentage: Number
  }
}, {
  timestamps: true
});

// Trip Statistics Schema
const tripStatisticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  lifetime: {
    totalTrips: {
      type: Number,
      default: 0
    },
    totalDays: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    averageTripDuration: {
      type: Number,
      default: 0
    },
    averageTripCost: {
      type: Number,
      default: 0
    },
    totalDistance: {
      type: Number,
      default: 0 // km
    },
    uniqueCountries: {
      type: Number,
      default: 0
    },
    uniqueCities: {
      type: Number,
      default: 0
    },
    totalCarbonFootprint: {
      type: Number,
      default: 0
    }
  },
  yearly: [{
    year: Number,
    trips: Number,
    days: Number,
    cost: Number,
    countries: Number,
    cities: Number,
    distance: Number,
    carbonFootprint: Number
  }],
  preferences: {
    favoriteDestinations: [{
      destination: String,
      visits: Number,
      totalDays: Number,
      averageRating: Number,
      lastVisit: Date
    }],
    favoriteCategories: [{
      category: String,
      count: Number,
      percentage: Number
    }],
    travelStyle: {
      budgetRange: {
        min: Number,
        max: Number,
        average: Number
      },
      durationPreference: {
        average: Number,
        shortest: Number,
        longest: Number
      },
      seasonality: [{
        month: Number,
        trips: Number
      }],
      companionTypes: [{
        type: String, // solo, family, friends, couple
        percentage: Number
      }]
    }
  },
  achievements: [{
    type: {
      type: String,
      enum: [
        'first_trip', 'world_traveler', 'continent_hopper', 'budget_master',
        'luxury_explorer', 'eco_warrior', 'culture_seeker', 'adventure_junkie',
        'foodie_explorer', 'photo_master', 'blog_writer', 'social_butterfly'
      ]
    },
    title: String,
    description: String,
    unlockedAt: Date,
    criteria: {
      threshold: Number,
      metric: String
    },
    badge: String,
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  rankings: {
    globalRank: Number,
    countryRank: Number,
    categoryRanks: [{
      category: String,
      rank: Number,
      totalUsers: Number
    }]
  }
}, {
  timestamps: true
});

// Travel Insights Schema
const travelInsightsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', 'lifetime'],
    required: true
  },
  insights: [{
    type: {
      type: String,
      enum: [
        'spending_pattern', 'travel_frequency', 'destination_preference',
        'seasonal_trend', 'budget_optimization', 'carbon_impact',
        'experience_rating', 'social_engagement', 'growth_milestone'
      ],
      required: true
    },
    title: String,
    description: String,
    data: mongoose.Schema.Types.Mixed,
    visualization: {
      type: String,
      enum: ['chart', 'map', 'timeline', 'comparison', 'gauge']
    },
    actionable: {
      suggestions: [String],
      potentialSavings: Number,
      improvementTips: [String]
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  recommendations: {
    destinations: [{
      name: String,
      country: String,
      score: Number,
      reasoning: [String],
      bestTime: String,
      estimatedCost: {
        min: Number,
        max: Number,
        currency: String
      },
      matchedPreferences: [String],
      alternativeOptions: [String]
    }],
    experiences: [{
      category: String,
      title: String,
      description: String,
      location: String,
      score: Number,
      reasoning: [String],
      estimatedCost: Number,
      duration: String
    }],
    budgetOptimizations: [{
      category: String,
      currentSpending: Number,
      optimizedSpending: Number,
      potentialSavings: Number,
      recommendations: [String]
    }],
    sustainabilityTips: [{
      category: String,
      impact: String, // high, medium, low
      suggestion: String,
      potentialReduction: Number, // kg CO2
      difficulty: String // easy, moderate, hard
    }]
  },
  metrics: {
    engagementScore: Number,
    explorationScore: Number,
    sustainabilityScore: Number,
    budgetEfficiencyScore: Number,
    socialScore: Number,
    overallScore: Number
  }
}, {
  timestamps: true
});

// Travel Goals Schema
const travelGoalsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  goals: [{
    type: {
      type: String,
      enum: [
        'visit_countries', 'visit_continents', 'budget_target', 'carbon_reduction',
        'trip_frequency', 'experience_category', 'distance_traveled', 'duration_target'
      ],
      required: true
    },
    title: String,
    description: String,
    target: {
      value: Number,
      unit: String
    },
    current: {
      value: Number,
      unit: String
    },
    deadline: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'abandoned'],
      default: 'active'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: String,
    milestones: [{
      description: String,
      targetValue: Number,
      completedAt: Date,
      reward: String
    }],
    progress: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      trend: String // improving, declining, stable
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date
  }],
  summary: {
    totalGoals: {
      type: Number,
      default: 0
    },
    completedGoals: {
      type: Number,
      default: 0
    },
    activeGoals: {
      type: Number,
      default: 0
    },
    overallProgress: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
AnalyticsSchema.index({ type: 1, createdAt: -1 });

// Compound indexes for better query performance
travelTimelineSchema.index({ user: 1, year: 1 });
travelTimelineSchema.index({ 'events.date': 1 });
travelTimelineSchema.index({ 'events.location.coordinates': '2dsphere' });

carbonFootprintSchema.index({ user: 1, year: 1, month: 1 });
carbonFootprintSchema.index({ totalEmissions: -1 });

tripStatisticsSchema.index({ user: 1 }, { unique: true });
tripStatisticsSchema.index({ 'lifetime.totalTrips': -1 });

travelInsightsSchema.index({ user: 1, period: 1 });
travelInsightsSchema.index({ generatedAt: -1 });

travelGoalsSchema.index({ user: 1 });
travelGoalsSchema.index({ 'goals.status': 1 });

// Pre-save middleware to calculate statistics
travelTimelineSchema.pre('save', function(next) {
  if (this.isModified('events')) {
    this.calculateStatistics();
  }
  next();
});

travelTimelineSchema.methods.calculateStatistics = function() {
  const events = this.events;
  const tripEvents = events.filter(e => e.type === 'trip');
  
  this.statistics.totalTrips = tripEvents.length;
  this.statistics.totalDays = tripEvents.reduce((sum, trip) => sum + (trip.metadata?.duration || 0), 0);
  this.statistics.totalCost = tripEvents.reduce((sum, trip) => sum + (trip.metadata?.cost || 0), 0);
  
  // Count unique countries and cities
  const countries = new Set();
  const cities = new Set();
  
  events.forEach(event => {
    if (event.location?.country) countries.add(event.location.country);
    if (event.location?.city) cities.add(event.location.city);
  });
  
  this.statistics.countriesVisited = countries.size;
  this.statistics.citiesVisited = cities.size;
  
  // Calculate top categories
  const categoryCount = {};
  events.forEach(event => {
    if (event.metadata?.category) {
      categoryCount[event.metadata.category] = (categoryCount[event.metadata.category] || 0) + 1;
    }
  });
  
  this.statistics.topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
};

// Virtual for completion percentage
travelGoalsSchema.virtual('completionRate').get(function() {
  if (this.summary.totalGoals === 0) return 0;
  return Math.round((this.summary.completedGoals / this.summary.totalGoals) * 100);
});
AnalyticsSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
AnalyticsSchema.index({ user: 1, createdAt: -1 });
AnalyticsSchema.index({ sessionId: 1, createdAt: -1 });

// Static methods for analytics

// Track page view
AnalyticsSchema.statics.trackPageView = async function(data) {
  try {
    const analytics = new this({
      type: 'page_view',
      path: data.path,
      user: data.userId || null,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
      device: data.device,
      loadTime: data.loadTime
    });
    
    await analytics.save();
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track content view (blog/package)
AnalyticsSchema.statics.trackContentView = async function(data) {
  try {
    const analytics = new this({
      type: data.targetType.toLowerCase() + '_view',
      targetType: data.targetType,
      targetId: data.targetId,
      user: data.userId || null,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
      device: data.device
    });
    
    await analytics.save();
  } catch (error) {
    console.error('Error tracking content view:', error);
  }
};

// Track user action
AnalyticsSchema.statics.trackUserAction = async function(data) {
  try {
    const analytics = new this({
      type: 'user_action',
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      user: data.userId,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      metadata: data.metadata
    });
    
    await analytics.save();
  } catch (error) {
    console.error('Error tracking user action:', error);
  }
};

// Get popular content
AnalyticsSchema.statics.getPopularContent = async function(targetType, timeframe = '7d', limit = 10) {
  const startDate = new Date();
  switch (timeframe) {
    case '1d':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
  }

  return await this.aggregate([
    {
      $match: {
        type: targetType.toLowerCase() + '_view',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$targetId',
        views: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        lastViewed: { $max: '$createdAt' }
      }
    },
    {
      $addFields: {
        uniqueViewers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { views: -1 } },
    { $limit: limit }
  ]);
};

// Get analytics dashboard data
AnalyticsSchema.statics.getDashboardStats = async function(timeframe = '7d') {
  const startDate = new Date();
  switch (timeframe) {
    case '1d':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
  }

  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' }
      }
    }
  ]);

  const totalViews = await this.countDocuments({
    type: { $in: ['page_view', 'blog_view', 'package_view'] },
    createdAt: { $gte: startDate }
  });

  const uniqueVisitors = await this.distinct('sessionId', {
    createdAt: { $gte: startDate }
  });

  return {
    totalViews,
    uniqueVisitors: uniqueVisitors.length,
    breakdown: stats,
    timeframe
  };
};

module.exports = {
  Analytics: mongoose.model('Analytics', AnalyticsSchema),
  TravelTimeline: mongoose.model('TravelTimeline', travelTimelineSchema),
  CarbonFootprint: mongoose.model('CarbonFootprint', carbonFootprintSchema),
  TripStatistics: mongoose.model('TripStatistics', tripStatisticsSchema),
  TravelInsights: mongoose.model('TravelInsights', travelInsightsSchema),
  TravelGoals: mongoose.model('TravelGoals', travelGoalsSchema)
};
