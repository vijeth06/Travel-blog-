const mongoose = require('mongoose');

// Affiliate Program Schema
const affiliateProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  company: {
    name: {
      type: String,
      required: true
    },
    website: String,
    logo: String,
    contactInfo: {
      email: String,
      phone: String,
      address: String
    }
  },
  // Commission structure
  commission: {
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'tiered'],
      default: 'percentage'
    },
    rate: Number, // percentage or fixed amount
    currency: {
      type: String,
      default: 'USD'
    },
    tiers: [{
      minSales: Number,
      rate: Number,
      description: String
    }]
  },
  // Product categories this program covers
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  // Tracking and attribution
  trackingMethod: {
    type: String,
    enum: ['cookie', 'url_parameter', 'postback'],
    default: 'cookie'
  },
  cookieDuration: {
    type: Number,
    default: 30 // days
  },
  // Program settings
  status: {
    type: String,
    enum: ['active', 'paused', 'inactive'],
    default: 'active'
  },
  minPayout: {
    type: Number,
    default: 50
  },
  paymentSchedule: {
    type: String,
    enum: ['monthly', 'bi-monthly', 'quarterly'],
    default: 'monthly'
  },
  // Application and approval
  requiresApproval: {
    type: Boolean,
    default: true
  },
  applicationRequirements: [String],
  // Terms and conditions
  terms: {
    agreementUrl: String,
    lastUpdated: Date,
    version: String
  }
}, {
  timestamps: true
});

// Affiliate User Schema
const affiliateUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Affiliate profile
  profile: {
    businessName: String,
    taxId: String,
    paymentMethod: {
      type: String,
      enum: ['paypal', 'bank_transfer', 'stripe'],
      default: 'paypal'
    },
    paymentDetails: {
      email: String, // for PayPal
      bankAccount: {
        accountNumber: String,
        routingNumber: String,
        bankName: String
      },
      stripeAccountId: String
    }
  },
  // Programs the user is enrolled in
  programs: [{
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AffiliateProgram'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    appliedAt: Date,
    approvedAt: Date,
    uniqueCode: String, // Unique affiliate code for tracking
    customCommissionRate: Number // Override program rate if negotiated
  }],
  // Performance metrics
  stats: {
    totalClicks: { type: Number, default: 0 },
    totalConversions: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 },
    paidEarnings: { type: Number, default: 0 }
  },
  // Referral tracking
  referralCode: {
    type: String,
    unique: true,
    required: true
  },
  customDomain: String, // Custom domain for affiliate links
  // Status and verification
  status: {
    type: String,
    enum: ['active', 'suspended', 'terminated'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    url: String,
    uploadedAt: Date,
    verified: Boolean
  }]
}, {
  timestamps: true
});

// Affiliate Link Schema
const affiliateLinkSchema = new mongoose.Schema({
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateUser',
    required: true
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateProgram',
    required: true
  },
  // Link details
  originalUrl: {
    type: String,
    required: true
  },
  shortUrl: String,
  customAlias: String,
  title: String,
  description: String,
  // Tracking parameters
  trackingId: {
    type: String,
    unique: true,
    required: true
  },
  utmParameters: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  // Analytics
  analytics: {
    clicks: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    clicksByCountry: [{
      country: String,
      clicks: Number
    }],
    clicksByDevice: [{
      device: String,
      clicks: Number
    }],
    clicksByReferrer: [{
      referrer: String,
      clicks: Number
    }]
  },
  // Content association
  associatedContent: {
    type: String,
    enum: ['blog', 'package', 'video', 'photo', 'review'],
    contentId: mongoose.Schema.Types.ObjectId
  },
  // Status and settings
  status: {
    type: String,
    enum: ['active', 'paused', 'expired'],
    default: 'active'
  },
  expiresAt: Date,
  // Fraud prevention
  fraudDetection: {
    suspicious: Boolean,
    flags: [String],
    lastChecked: Date
  }
}, {
  timestamps: true
});

// Subscription Plan Schema
const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  description: String,
  // Pricing
  pricing: {
    monthly: {
      amount: Number,
      currency: { type: String, default: 'USD' }
    },
    yearly: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      discount: Number // percentage discount from monthly * 12
    },
    lifetime: {
      amount: Number,
      currency: { type: String, default: 'USD' }
    }
  },
  // Features included in this plan
  features: {
    // Content limits
    blogPostLimit: { type: Number, default: -1 }, // -1 = unlimited
    videoUploadLimit: { type: Number, default: -1 }, // in GB
    photo360Limit: { type: Number, default: -1 },
    packageCreationLimit: { type: Number, default: -1 },
    
    // Advanced features
    advancedAnalytics: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    affiliateAccess: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    
    // Social features
    forumModeration: { type: Boolean, default: false },
    verifiedBadge: { type: Boolean, default: false },
    featuredContent: { type: Boolean, default: false },
    
    // Monetization
    adRevenue: { type: Number, default: 0 }, // percentage of ad revenue shared
    sponsoredContent: { type: Boolean, default: false },
    merchandiseStore: { type: Boolean, default: false }
  },
  // Plan configuration
  trialPeriod: {
    enabled: { type: Boolean, default: false },
    duration: { type: Number, default: 7 } // days
  },
  setupFee: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  // Visibility and availability
  isPublic: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  // Stripe integration
  stripeProductId: String,
  stripePriceIds: {
    monthly: String,
    yearly: String,
    lifetime: String
  }
}, {
  timestamps: true
});

// User Subscription Schema
const userSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  // Subscription details
  status: {
    type: String,
    enum: ['trial', 'active', 'cancelled', 'expired', 'past_due', 'suspended'],
    default: 'trial'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime'],
    required: true
  },
  // Dates
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  trialEndDate: Date,
  cancelledAt: Date,
  // Payment information
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  // Usage tracking
  usage: {
    blogPosts: { type: Number, default: 0 },
    videoUploads: { type: Number, default: 0 }, // in GB
    photo360s: { type: Number, default: 0 },
    packagesCreated: { type: Number, default: 0 },
    apiCalls: { type: Number, default: 0 },
    resetDate: Date // When usage counters reset (monthly/yearly)
  },
  // Billing history
  payments: [{
    amount: Number,
    currency: String,
    date: Date,
    stripePaymentIntentId: String,
    status: String,
    description: String
  }],
  // Cancellation
  cancellation: {
    reason: String,
    feedback: String,
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', 'system']
    }
  }
}, {
  timestamps: true
});

// Sponsored Content Schema
const sponsoredContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  sponsor: {
    name: {
      type: String,
      required: true
    },
    logo: String,
    website: String,
    contactPerson: {
      name: String,
      email: String,
      phone: String
    }
  },
  // Campaign details
  campaign: {
    objective: {
      type: String,
      enum: ['brand_awareness', 'lead_generation', 'sales', 'engagement'],
      required: true
    },
    targetAudience: {
      demographics: {
        ageRange: {
          min: Number,
          max: Number
        },
        gender: [String],
        interests: [String],
        locations: [String]
      },
      behavioral: {
        travelFrequency: String,
        budgetRange: String,
        travelStyle: [String]
      }
    },
    budget: {
      total: Number,
      currency: { type: String, default: 'USD' },
      paymentModel: {
        type: String,
        enum: ['cpm', 'cpc', 'cpa', 'flat_rate'],
        default: 'flat_rate'
      },
      rate: Number
    }
  },
  // Content specifications
  content: {
    type: {
      type: String,
      enum: ['blog_post', 'video', 'social_post', 'banner', 'native'],
      required: true
    },
    format: String,
    duration: Number, // for videos
    wordCount: Number, // for articles
    specifications: mongoose.Schema.Types.Mixed,
    deliverables: [String]
  },
  // Creator assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applicationDeadline: Date,
  submissionDeadline: Date,
  // Content approval
  submissions: [{
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contentUrl: String,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revision_requested'],
      default: 'pending'
    },
    feedback: String,
    revisionCount: { type: Number, default: 0 }
  }],
  // Campaign tracking
  performance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    engagements: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // click-through rate
    engagementRate: { type: Number, default: 0 }
  },
  // Campaign status and dates
  status: {
    type: String,
    enum: ['draft', 'open_for_applications', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  startDate: Date,
  endDate: Date,
  // Legal and compliance
  disclosureRequired: { type: Boolean, default: true },
  ftcCompliant: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false },
  contractUrl: String
}, {
  timestamps: true
});

// Revenue Share Schema
const revenueShareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Revenue sources
  sources: {
    adRevenue: {
      enabled: { type: Boolean, default: false },
      percentage: { type: Number, default: 0 }, // percentage shared with creator
      minimumViews: { type: Number, default: 1000 }
    },
    affiliateCommissions: {
      enabled: { type: Boolean, default: false },
      percentage: { type: Number, default: 50 } // platform's cut
    },
    sponsoredContent: {
      enabled: { type: Boolean, default: false },
      percentage: { type: Number, default: 20 } // platform's cut
    },
    subscriptions: {
      enabled: { type: Boolean, default: false },
      percentage: { type: Number, default: 70 } // creator's share
    }
  },
  // Earnings tracking
  earnings: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    lastMonth: { type: Number, default: 0 }
  },
  // Payment settings
  paymentSettings: {
    minimumPayout: { type: Number, default: 100 },
    currency: { type: String, default: 'USD' },
    schedule: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    method: {
      type: String,
      enum: ['paypal', 'stripe', 'bank_transfer'],
      default: 'paypal'
    },
    details: mongoose.Schema.Types.Mixed
  },
  // Tax information
  taxInfo: {
    w9Submitted: { type: Boolean, default: false },
    taxId: String,
    country: String,
    vatNumber: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
affiliateProgramSchema.index({ status: 1, 'commission.type': 1 });
affiliateUserSchema.index({ user: 1 }, { unique: true });
affiliateUserSchema.index({ referralCode: 1 }, { unique: true });
affiliateLinkSchema.index({ trackingId: 1 }, { unique: true });
affiliateLinkSchema.index({ affiliate: 1, status: 1 });

subscriptionPlanSchema.index({ isActive: 1, isPublic: 1 });
userSubscriptionSchema.index({ user: 1, status: 1 });
userSubscriptionSchema.index({ endDate: 1, status: 1 });

sponsoredContentSchema.index({ status: 1, startDate: 1, endDate: 1 });
sponsoredContentSchema.index({ assignedTo: 1, status: 1 });

revenueShareSchema.index({ user: 1 }, { unique: true });

// Create models
const AffiliateProgram = mongoose.model('AffiliateProgram', affiliateProgramSchema);
const AffiliateUser = mongoose.model('AffiliateUser', affiliateUserSchema);
const AffiliateLink = mongoose.model('AffiliateLink', affiliateLinkSchema);
const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);
const SponsoredContent = mongoose.model('SponsoredContent', sponsoredContentSchema);
const RevenueShare = mongoose.model('RevenueShare', revenueShareSchema);

module.exports = {
  AffiliateProgram,
  AffiliateUser,
  AffiliateLink,
  SubscriptionPlan,
  UserSubscription,
  SponsoredContent,
  RevenueShare
};