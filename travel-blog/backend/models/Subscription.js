const mongoose = require('mongoose');

// Real subscription model with comprehensive feature management
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  plan: {
    type: String,
    required: true,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'suspended', 'trial'],
    default: 'inactive'
  },
  
  billing: {
    cycle: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    nextBillingDate: Date,
    lastBillingDate: Date,
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'crypto'],
      required: true
    },
    paymentMethodId: String, // Payment gateway reference
    invoiceHistory: [{
      invoiceId: String,
      amount: Number,
      date: Date,
      status: { type: String, enum: ['paid', 'pending', 'failed', 'refunded'] },
      paymentGatewayId: String
    }]
  },
  
  features: {
    // Content features
    maxBlogs: { type: Number, default: 5 },
    maxPhotos: { type: Number, default: 50 },
    maxVideos: { type: Number, default: 0 },
    advancedEditor: { type: Boolean, default: false },
    customThemes: { type: Boolean, default: false },
    
    // Analytics features
    analyticsAccess: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    exportData: { type: Boolean, default: false },
    
    // Social features
    prioritySupport: { type: Boolean, default: false },
    verifiedBadge: { type: Boolean, default: false },
    customProfile: { type: Boolean, default: false },
    
    // AI features
    aiRecommendations: { type: Boolean, default: true },
    advancedAI: { type: Boolean, default: false },
    personalizedInsights: { type: Boolean, default: false },
    
    // Integration features
    externalIntegrations: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    webhooks: { type: Boolean, default: false },
    
    // Monetization features
    adsRemoval: { type: Boolean, default: false },
    monetizationTools: { type: Boolean, default: false },
    commissionsReduced: { type: Boolean, default: false }
  },
  
  limits: {
    // Current usage
    blogsUsed: { type: Number, default: 0 },
    photosUsed: { type: Number, default: 0 },
    videosUsed: { type: Number, default: 0 },
    
    // Reset dates
    limitsResetDate: { type: Date, default: Date.now },
    
    // Special limits
    customLimits: [{
      feature: String,
      limit: Number,
      used: { type: Number, default: 0 }
    }]
  },
  
  trial: {
    isTrialUser: { type: Boolean, default: false },
    trialStartDate: Date,
    trialEndDate: Date,
    trialPlan: String,
    hasUsedTrial: { type: Boolean, default: false }
  },
  
  discounts: {
    couponCode: String,
    discountPercent: { type: Number, min: 0, max: 100 },
    discountAmount: { type: Number, min: 0 },
    validUntil: Date,
    appliedDate: Date
  },
  
  subscription: {
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    autoRenew: { type: Boolean, default: true },
    cancelationDate: Date,
    cancelationReason: String,
    pausedUntil: Date
  },
  
  metadata: {
    referralCode: String,
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acquisitionChannel: String,
    customerLifetimeValue: { type: Number, default: 0 },
    churnRisk: { type: Number, min: 0, max: 100, default: 0 }
  }
}, {
  timestamps: true
});

// REAL methods for subscription management
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && (!this.subscription.endDate || this.subscription.endDate > new Date());
};

subscriptionSchema.methods.hasFeature = function(featureName) {
  return this.features[featureName] === true;
};

subscriptionSchema.methods.canUseFeature = function(featureName, requestedUsage = 1) {
  const limit = this.features[`max${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`];
  const used = this.limits[`${featureName}Used`];
  
  if (limit === -1) return true; // Unlimited
  if (!limit) return false; // Not allowed
  
  return (used + requestedUsage) <= limit;
};

subscriptionSchema.methods.useFeature = function(featureName, usage = 1) {
  const usageField = `${featureName}Used`;
  
  if (this.canUseFeature(featureName, usage)) {
    this.limits[usageField] += usage;
    return this.save();
  }
  
  throw new Error(`Feature usage limit exceeded for ${featureName}`);
};

subscriptionSchema.methods.resetLimits = function() {
  this.limits.blogsUsed = 0;
  this.limits.photosUsed = 0;
  this.limits.videosUsed = 0;
  this.limits.limitsResetDate = new Date();
  
  // Reset custom limits
  this.limits.customLimits.forEach(limit => {
    limit.used = 0;
  });
  
  return this.save();
};

subscriptionSchema.methods.upgrade = function(newPlan, billingCycle) {
  const planFeatures = this.constructor.getPlanFeatures(newPlan);
  
  this.plan = newPlan;
  this.billing.cycle = billingCycle;
  this.billing.amount = this.constructor.getPlanPricing(newPlan, billingCycle);
  this.features = { ...this.features, ...planFeatures };
  this.status = 'active';
  
  return this.save();
};

subscriptionSchema.methods.downgrade = function(newPlan, billingCycle) {
  const planFeatures = this.constructor.getPlanFeatures(newPlan);
  
  this.plan = newPlan;
  this.billing.cycle = billingCycle;
  this.billing.amount = this.constructor.getPlanPricing(newPlan, billingCycle);
  this.features = planFeatures;
  this.status = 'active';
  
  return this.save();
};

subscriptionSchema.methods.cancel = function(reason = 'User requested') {
  this.status = 'cancelled';
  this.subscription.cancelationDate = new Date();
  this.subscription.cancelationReason = reason;
  this.subscription.autoRenew = false;
  
  return this.save();
};

subscriptionSchema.methods.renew = function() {
  if (this.billing.cycle === 'monthly') {
    this.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    this.billing.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (this.billing.cycle === 'yearly') {
    this.subscription.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    this.billing.nextBillingDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }
  
  this.billing.lastBillingDate = new Date();
  this.status = 'active';
  
  return this.save();
};

// REAL static methods for subscription operations
subscriptionSchema.statics.getPlanFeatures = function(plan) {
  const planFeatures = {
    free: {
      maxBlogs: 5,
      maxPhotos: 50,
      maxVideos: 0,
      advancedEditor: false,
      customThemes: false,
      analyticsAccess: false,
      advancedAnalytics: false,
      exportData: false,
      prioritySupport: false,
      verifiedBadge: false,
      customProfile: false,
      aiRecommendations: true,
      advancedAI: false,
      personalizedInsights: false,
      externalIntegrations: false,
      apiAccess: false,
      webhooks: false,
      adsRemoval: false,
      monetizationTools: false,
      commissionsReduced: false
    },
    basic: {
      maxBlogs: 25,
      maxPhotos: 500,
      maxVideos: 10,
      advancedEditor: true,
      customThemes: true,
      analyticsAccess: true,
      advancedAnalytics: false,
      exportData: false,
      prioritySupport: false,
      verifiedBadge: true,
      customProfile: true,
      aiRecommendations: true,
      advancedAI: true,
      personalizedInsights: true,
      externalIntegrations: false,
      apiAccess: false,
      webhooks: false,
      adsRemoval: true,
      monetizationTools: false,
      commissionsReduced: false
    },
    premium: {
      maxBlogs: 100,
      maxPhotos: 2000,
      maxVideos: 50,
      advancedEditor: true,
      customThemes: true,
      analyticsAccess: true,
      advancedAnalytics: true,
      exportData: true,
      prioritySupport: true,
      verifiedBadge: true,
      customProfile: true,
      aiRecommendations: true,
      advancedAI: true,
      personalizedInsights: true,
      externalIntegrations: true,
      apiAccess: true,
      webhooks: false,
      adsRemoval: true,
      monetizationTools: true,
      commissionsReduced: true
    },
    enterprise: {
      maxBlogs: -1, // Unlimited
      maxPhotos: -1,
      maxVideos: -1,
      advancedEditor: true,
      customThemes: true,
      analyticsAccess: true,
      advancedAnalytics: true,
      exportData: true,
      prioritySupport: true,
      verifiedBadge: true,
      customProfile: true,
      aiRecommendations: true,
      advancedAI: true,
      personalizedInsights: true,
      externalIntegrations: true,
      apiAccess: true,
      webhooks: true,
      adsRemoval: true,
      monetizationTools: true,
      commissionsReduced: true
    }
  };
  
  return planFeatures[plan] || planFeatures.free;
};

subscriptionSchema.statics.getPlanPricing = function(plan, billingCycle) {
  const pricing = {
    free: { monthly: 0, yearly: 0 },
    basic: { monthly: 9.99, yearly: 99.99 },
    premium: { monthly: 29.99, yearly: 299.99 },
    enterprise: { monthly: 99.99, yearly: 999.99 }
  };
  
  return pricing[plan]?.[billingCycle] || 0;
};

subscriptionSchema.statics.createFreeSubscription = function(userId) {
  return this.create({
    user: userId,
    plan: 'free',
    status: 'active',
    billing: {
      cycle: 'monthly',
      amount: 0,
      paymentMethod: 'none'
    },
    features: this.getPlanFeatures('free'),
    subscription: {
      startDate: new Date(),
      autoRenew: false
    }
  });
};

subscriptionSchema.statics.findExpiringSoon = function(days = 7) {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'active',
    'subscription.endDate': { $lte: futureDate, $gte: new Date() },
    'subscription.autoRenew': true
  }).populate('user', 'email firstName lastName');
};

subscriptionSchema.statics.getRevenueStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'billing.lastBillingDate': { $gte: startDate, $lte: endDate },
        status: 'active'
      }
    },
    {
      $group: {
        _id: {
          plan: '$plan',
          cycle: '$billing.cycle'
        },
        totalRevenue: { $sum: '$billing.amount' },
        subscriberCount: { $sum: 1 },
        avgRevenue: { $avg: '$billing.amount' }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    }
  ]);
};

// Indexes for better performance
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1, plan: 1 });
subscriptionSchema.index({ 'subscription.endDate': 1, status: 1 });
subscriptionSchema.index({ 'billing.nextBillingDate': 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);