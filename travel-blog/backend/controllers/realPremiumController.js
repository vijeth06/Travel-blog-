const RealPremiumService = require('../services/realPremiumService');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

class RealPremiumController {
  /**
   * Get available subscription plans
   */
  static async getPlans(req, res) {
    try {
      const plans = [
        {
          id: 'free',
          name: 'Free',
          description: 'Perfect for getting started with travel blogging',
          price: {
            monthly: 0,
            yearly: 0
          },
          features: Subscription.getPlanFeatures('free'),
          limits: {
            blogs: 5,
            photos: 50,
            videos: 0
          },
          popular: false,
          trial: false
        },
        {
          id: 'basic',
          name: 'Basic',
          description: 'Great for casual travel bloggers and content creators',
          price: {
            monthly: 9.99,
            yearly: 99.99,
            yearlyDiscount: 17 // 2 months free
          },
          features: Subscription.getPlanFeatures('basic'),
          limits: {
            blogs: 25,
            photos: 500,
            videos: 10
          },
          popular: false,
          trial: true,
          trialDays: 14
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'Perfect for serious travel influencers and professionals',
          price: {
            monthly: 29.99,
            yearly: 299.99,
            yearlyDiscount: 17
          },
          features: Subscription.getPlanFeatures('premium'),
          limits: {
            blogs: 100,
            photos: 2000,
            videos: 50
          },
          popular: true,
          trial: true,
          trialDays: 14
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'For travel agencies and large content teams',
          price: {
            monthly: 99.99,
            yearly: 999.99,
            yearlyDiscount: 17
          },
          features: Subscription.getPlanFeatures('enterprise'),
          limits: {
            blogs: 'unlimited',
            photos: 'unlimited',
            videos: 'unlimited'
          },
          popular: false,
          trial: true,
          trialDays: 30,
          contactSales: true
        }
      ];
      
      res.json({
        success: true,
        message: 'Subscription plans retrieved successfully',
        data: {
          plans,
          currencies: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
          paymentMethods: ['credit_card', 'paypal', 'stripe'],
          guarantees: [
            '30-day money-back guarantee',
            'Cancel anytime',
            'No setup fees',
            'Instant activation'
          ]
        }
      });
      
    } catch (error) {
      logger.error('❌ Get Plans Error:', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription plans',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Create new subscription
   */
  static async createSubscription(req, res) {
    try {
      const { plan, billingCycle, paymentDetails } = req.body;
      const userId = req.user.id;
      
      logger.info(`💎 Creating subscription: ${plan} (${billingCycle}) for user ${userId}`);
      
      // Validate required fields
      if (!plan || !billingCycle || !paymentDetails) {
        return res.status(400).json({
          success: false,
          message: 'Plan, billing cycle, and payment details are required'
        });
      }
      
      const result = await RealPremiumService.createSubscription(userId, plan, billingCycle, paymentDetails);
      
      logger.info(`✅ Subscription created successfully: ${result.subscription._id}`);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          subscription: result.subscription,
          payment: {
            transactionId: result.paymentResult.transactionId,
            amount: result.paymentResult.amount,
            currency: result.paymentResult.currency
          },
          rewards: {
            pointsAwarded: result.pointsAwarded
          },
          nextSteps: [
            'Explore your premium features',
            'Download the mobile app for premium benefits',
            'Join the premium community',
            'Set up your advanced analytics'
          ]
        }
      });
      
    } catch (error) {
      logger.error('❌ Create Subscription Error:', { error: error.message, userId: req.user.id });
      
      if (error.message.includes('already has an active subscription')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          suggestion: 'Consider upgrading your existing subscription instead'
        });
      }
      
      if (error.message.includes('Payment failed')) {
        return res.status(402).json({
          success: false,
          message: error.message,
          suggestion: 'Please check your payment details and try again'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Get user's current subscription
   */
  static async getCurrentSubscription(req, res) {
    try {
      const userId = req.user.id;
      
      logger.info(`📋 Getting subscription for user ${userId}`);
      
      const subscription = await Subscription.findOne({ user: userId }).populate('user', 'username email firstName lastName');
      
      if (!subscription) {
        // Create free subscription if none exists
        const freeSubscription = await Subscription.createFreeSubscription(userId);
        await freeSubscription.populate('user', 'username email firstName lastName');
        
        return res.json({
          success: true,
          message: 'Free subscription created',
          data: {
            subscription: freeSubscription,
            isNew: true
          }
        });
      }
      
      // Calculate usage statistics
      const usageStats = {
        blogs: {
          used: subscription.limits.blogsUsed,
          limit: subscription.features.maxBlogs,
          percentage: subscription.features.maxBlogs === -1 ? 0 : 
            Math.round((subscription.limits.blogsUsed / subscription.features.maxBlogs) * 100)
        },
        photos: {
          used: subscription.limits.photosUsed,
          limit: subscription.features.maxPhotos,
          percentage: subscription.features.maxPhotos === -1 ? 0 : 
            Math.round((subscription.limits.photosUsed / subscription.features.maxPhotos) * 100)
        },
        videos: {
          used: subscription.limits.videosUsed,
          limit: subscription.features.maxVideos,
          percentage: subscription.features.maxVideos === -1 ? 0 : 
            Math.round((subscription.limits.videosUsed / subscription.features.maxVideos) * 100)
        }
      };
      
      // Check if subscription is expiring soon
      const daysUntilExpiry = subscription.subscription.endDate ? 
        Math.ceil((subscription.subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
      
      logger.info(`✅ Subscription retrieved successfully`);
      
      res.json({
        success: true,
        message: 'Current subscription retrieved successfully',
        data: {
          subscription,
          usage: usageStats,
          status: {
            isActive: subscription.isActive(),
            isTrial: subscription.trial.isTrialUser,
            daysUntilExpiry,
            expiringsoon: daysUntilExpiry && daysUntilExpiry <= 7,
            autoRenew: subscription.subscription.autoRenew
          },
          recommendations: this.generateUpgradeRecommendations(subscription, usageStats)
        }
      });
      
    } catch (error) {
      logger.error('❌ Get Current Subscription Error:', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Upgrade subscription
   */
  static async upgradeSubscription(req, res) {
    try {
      const { newPlan, billingCycle, paymentDetails } = req.body;
      const userId = req.user.id;
      
      logger.info(`⬆️ Upgrading subscription to ${newPlan} for user ${userId}`);
      
      if (!newPlan || !billingCycle) {
        return res.status(400).json({
          success: false,
          message: 'New plan and billing cycle are required'
        });
      }
      
      const result = await RealPremiumService.upgradeSubscription(userId, newPlan, billingCycle, paymentDetails);
      
      logger.info(`✅ Subscription upgraded successfully`);
      
      res.json({
        success: true,
        message: result.message,
        data: {
          subscription: result.subscription,
          upgrade: {
            proratedAmount: result.proratedAmount,
            pointsAwarded: result.pointsAwarded
          },
          newFeatures: Subscription.getPlanFeatures(newPlan),
          benefits: this.getUpgradeBenefits(result.subscription.plan, newPlan)
        }
      });
      
    } catch (error) {
      logger.error('❌ Upgrade Subscription Error:', { error: error.message, userId: req.user.id });
      
      if (error.message.includes('Cannot upgrade to a lower')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          suggestion: 'Consider downgrading instead or choose a higher plan'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to upgrade subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Cancel subscription
   */
  static async cancelSubscription(req, res) {
    try {
      const { reason, immediate = false } = req.body;
      const userId = req.user.id;
      
      logger.info(`❌ Cancelling subscription for user ${userId}`);
      
      const result = await RealPremiumService.cancelSubscription(userId, reason, immediate);
      
      logger.info(`✅ Subscription cancelled successfully`);
      
      res.json({
        success: true,
        message: result.message,
        data: {
          subscription: result.subscription,
          cancellation: {
            immediate: result.immediate,
            endDate: result.endDate,
            reason: reason
          },
          retentionOffer: {
            discount: '25% off next renewal',
            extendedTrial: '30 additional days free',
            pauseOption: 'Pause subscription for up to 3 months'
          }
        }
      });
      
    } catch (error) {
      logger.error('❌ Cancel Subscription Error:', { error: error.message, userId: req.user.id });
      
      if (error.message.includes('No subscription found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Start free trial
   */
  static async startTrial(req, res) {
    try {
      const { trialPlan = 'premium', trialDays = 14 } = req.body;
      const userId = req.user.id;
      
      logger.info(`🆓 Starting ${trialDays}-day ${trialPlan} trial for user ${userId}`);
      
      const result = await RealPremiumService.startTrial(userId, trialPlan, trialDays);
      
      logger.info(`✅ Trial started successfully`);
      
      res.json({
        success: true,
        message: result.message,
        data: {
          trial: {
            plan: trialPlan,
            startDate: result.subscription.trial.trialStartDate,
            endDate: result.trialEndDate,
            daysRemaining: result.daysRemaining
          },
          features: result.subscription.features,
          trialTips: [
            'Explore advanced analytics in your dashboard',
            'Try the AI recommendation system',
            'Upload unlimited photos and videos',
            'Access premium themes and customization',
            'Use advanced editing tools'
          ],
          reminderSchedule: {
            day3: 'Tips and tricks email',
            day7: 'Halfway reminder',
            day12: 'Conversion offer',
            day14: 'Trial ending notification'
          }
        }
      });
      
    } catch (error) {
      logger.error('❌ Start Trial Error:', { error: error.message, userId: req.user.id });
      
      if (error.message.includes('already used their trial')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          suggestion: 'Consider our current promotional offers instead'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to start trial',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Validate feature access
   */
  static async validateFeature(req, res) {
    try {
      const { feature, usage = 1 } = req.query;
      const userId = req.user.id;
      
      if (!feature) {
        return res.status(400).json({
          success: false,
          message: 'Feature parameter is required'
        });
      }
      
      logger.info(`🔧 Validating feature access: ${feature} for user ${userId}`);
      
      const validation = await RealPremiumService.validateFeatureAccess(userId, feature, parseInt(usage));
      
      res.json({
        success: true,
        message: 'Feature access validation completed',
        data: {
          feature,
          allowed: validation.allowed,
          reason: validation.reason,
          upgradeRequired: validation.upgradeRequired,
          recommendedPlan: validation.recommendedPlan,
          remainingUsage: validation.remainingUsage,
          resetDate: validation.resetDate
        }
      });
      
    } catch (error) {
      logger.error('❌ Validate Feature Error:', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        message: 'Failed to validate feature access',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Use a premium feature
   */
  static async useFeature(req, res) {
    try {
      const { feature, usage = 1 } = req.body;
      const userId = req.user.id;
      
      if (!feature) {
        return res.status(400).json({
          success: false,
          message: 'Feature parameter is required'
        });
      }
      
      logger.info(`🔧 Using feature: ${feature} (${usage}) for user ${userId}`);
      
      const result = await RealPremiumService.useFeature(userId, feature, parseInt(usage));
      
      // Award points for feature usage
      const RealGamificationService = require('../services/realGamificationService');
      await RealGamificationService.trackActivity(userId, 'premium_features_used');
      
      logger.info(`✅ Feature usage recorded successfully`);
      
      res.json({
        success: true,
        message: 'Feature used successfully',
        data: {
          feature,
          usageRecorded: result.usageRecorded,
          remainingUsage: result.remainingUsage,
          pointsAwarded: 5 // Small points for feature usage
        }
      });
      
    } catch (error) {
      logger.error('❌ Use Feature Error:', { error: error.message, userId: req.user.id });
      
      if (error.message.includes('Usage limit exceeded') || error.message.includes('not available')) {
        return res.status(403).json({
          success: false,
          message: error.message,
          upgradeRequired: true,
          recommendedPlan: RealPremiumService.getRecommendedPlan(req.body.feature)
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to use feature',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Get subscription analytics (admin only)
   */
  static async getAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      
      logger.info(`📊 Getting subscription analytics from ${start} to ${end}`);
      
      const analytics = await RealPremiumService.getSubscriptionAnalytics(start, end);
      
      logger.info(`✅ Analytics retrieved successfully`);
      
      res.json({
        success: true,
        message: 'Subscription analytics retrieved successfully',
        data: {
          period: { startDate: start, endDate: end },
          analytics,
          insights: {
            totalRevenue: analytics.revenueByPlan.reduce((sum, plan) => sum + plan.totalRevenue, 0),
            mostPopularPlan: analytics.revenueByPlan.sort((a, b) => b.subscriberCount - a.subscriberCount)[0]?._id,
            conversionRate: analytics.trialConversions[0]?.conversions || 0,
            churnedUsers: analytics.churnRate[0]?.churned || 0
          }
        }
      });
      
    } catch (error) {
      logger.error('❌ Get Analytics Error:', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Helper methods
   */
  static generateUpgradeRecommendations(subscription, usageStats) {
    const recommendations = [];
    
    // Check usage approaching limits
    Object.keys(usageStats).forEach(resource => {
      if (usageStats[resource].percentage > 80) {
        recommendations.push({
          type: 'usage_limit',
          message: `You're using ${usageStats[resource].percentage}% of your ${resource} limit`,
          suggestion: 'Consider upgrading to avoid hitting limits',
          urgency: usageStats[resource].percentage > 95 ? 'high' : 'medium'
        });
      }
    });
    
    // Plan-specific recommendations
    if (subscription.plan === 'free') {
      recommendations.push({
        type: 'plan_upgrade',
        message: 'Unlock advanced features with a paid plan',
        suggestion: 'Try our 14-day free trial of Premium',
        urgency: 'low'
      });
    }
    
    return recommendations;
  }
  
  static getUpgradeBenefits(oldPlan, newPlan) {
    const benefits = {
      'free_to_basic': [
        '5x more blog posts (25 total)',
        '10x more photo storage',
        'Advanced editor tools',
        'Custom themes',
        'Remove ads'
      ],
      'basic_to_premium': [
        '4x more content limits',
        'Advanced analytics',
        'AI recommendations',
        'External integrations',
        'Priority support'
      ],
      'premium_to_enterprise': [
        'Unlimited everything',
        'API access',
        'Custom webhooks',
        'White-label options',
        'Dedicated support'
      ]
    };
    
    return benefits[`${oldPlan}_to_${newPlan}`] || [];
  }
}

module.exports = RealPremiumController;