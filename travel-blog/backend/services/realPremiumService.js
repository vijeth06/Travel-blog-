const Subscription = require('../models/Subscription');
const User = require('../models/User');
const RealGamificationService = require('./realGamificationService');

class RealPremiumService {
  /**
   * REAL subscription creation with payment processing simulation
   */
  static async createSubscription(userId, plan, billingCycle, paymentDetails) {
    try {
      console.log(`💎 PREMIUM: Creating ${plan} subscription for user ${userId}`);
      
      // Check if user already has a subscription
      const existingSubscription = await Subscription.findOne({ user: userId });
      
      if (existingSubscription && existingSubscription.isActive()) {
        throw new Error('User already has an active subscription');
      }
      
      // Validate plan and billing cycle
      const validPlans = ['basic', 'premium', 'enterprise'];
      const validCycles = ['monthly', 'yearly'];
      
      if (!validPlans.includes(plan)) {
        throw new Error('Invalid subscription plan');
      }
      
      if (!validCycles.includes(billingCycle)) {
        throw new Error('Invalid billing cycle');
      }
      
      // Get plan pricing and features
      const amount = Subscription.getPlanPricing(plan, billingCycle);
      const features = Subscription.getPlanFeatures(plan);
      
      // REAL payment processing simulation
      const paymentResult = await this.processPayment(amount, paymentDetails);
      
      if (!paymentResult.success) {
        throw new Error(`Payment failed: ${paymentResult.error}`);
      }
      
      // Create or update subscription
      let subscription;
      if (existingSubscription) {
        subscription = existingSubscription;
        await subscription.upgrade(plan, billingCycle);
      } else {
        subscription = await Subscription.create({
          user: userId,
          plan,
          status: 'active',
          billing: {
            cycle: billingCycle,
            amount,
            currency: paymentDetails.currency || 'USD',
            paymentMethod: paymentDetails.method,
            paymentMethodId: paymentResult.paymentMethodId,
            nextBillingDate: this.calculateNextBillingDate(billingCycle),
            lastBillingDate: new Date(),
            invoiceHistory: [{
              invoiceId: paymentResult.invoiceId,
              amount,
              date: new Date(),
              status: 'paid',
              paymentGatewayId: paymentResult.transactionId
            }]
          },
          features,
          subscription: {
            startDate: new Date(),
            endDate: this.calculateEndDate(billingCycle),
            autoRenew: paymentDetails.autoRenew !== false
          }
        });
      }
      
      // Update user with premium status
      await User.findByIdAndUpdate(userId, {
        'premium.isPremium': true,
        'premium.plan': plan,
        'premium.subscriptionId': subscription._id
      });
      
      // Award gamification points for subscription
      const pointsAwarded = this.getPointsForSubscription(plan);
      await RealGamificationService.awardPoints(userId, pointsAwarded, `${plan} subscription activation`);
      
      console.log(`✅ PREMIUM: Subscription created successfully - ${subscription._id}`);
      
      return {
        subscription,
        paymentResult,
        pointsAwarded,
        message: `Welcome to ${plan.toUpperCase()}! Your subscription is now active.`
      };
      
    } catch (error) {
      console.error('❌ PREMIUM: Subscription creation error:', error.message);
      throw error;
    }
  }
  
  /**
   * REAL payment processing with validation
   */
  static async processPayment(amount, paymentDetails) {
    try {
      console.log(`💳 PREMIUM: Processing payment of ${amount} ${paymentDetails.currency || 'USD'}`);
      
      // Validate payment details
      if (!paymentDetails.method) {
        throw new Error('Payment method is required');
      }
      
      // Simulate payment gateway processing
      await this.simulatePaymentDelay();
      
      // Validate card details (for credit card payments)
      if (paymentDetails.method === 'credit_card') {
        if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
          throw new Error('Credit card details are incomplete');
        }
        
        // Basic card validation
        if (!this.validateCreditCard(paymentDetails.cardNumber)) {
          throw new Error('Invalid credit card number');
        }
      }
      
      // Simulate payment processing result
      const paymentSuccess = Math.random() > 0.05; // 95% success rate
      
      if (!paymentSuccess) {
        throw new Error('Payment declined by bank');
      }
      
      // Generate payment confirmation
      const paymentResult = {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        invoiceId: `inv_${Date.now()}`,
        paymentMethodId: `pm_${Math.random().toString(36).substr(2, 12)}`,
        amount,
        currency: paymentDetails.currency || 'USD',
        processedAt: new Date(),
        gateway: 'stripe_simulation'
      };
      
      console.log(`✅ PREMIUM: Payment processed successfully - ${paymentResult.transactionId}`);
      
      return paymentResult;
      
    } catch (error) {
      console.error('❌ PREMIUM: Payment processing error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * REAL feature access validation
   */
  static async validateFeatureAccess(userId, featureName, requestedUsage = 1) {
    try {
      const subscription = await Subscription.findOne({ user: userId });
      
      if (!subscription) {
        // Create free subscription if none exists
        await Subscription.createFreeSubscription(userId);
        const freeFeatures = Subscription.getPlanFeatures('free');
        return this.checkFeatureLimit(freeFeatures, featureName, requestedUsage);
      }
      
      if (!subscription.isActive()) {
        throw new Error('Subscription is not active. Please renew or upgrade.');
      }
      
      // Check feature availability
      if (!subscription.hasFeature(featureName)) {
        return {
          allowed: false,
          reason: `Feature '${featureName}' is not available in your ${subscription.plan} plan`,
          upgradeRequired: true,
          recommendedPlan: this.getRecommendedPlan(featureName)
        };
      }
      
      // Check usage limits
      if (!subscription.canUseFeature(featureName, requestedUsage)) {
        const limit = subscription.features[`max${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`];
        const used = subscription.limits[`${featureName}Used`];
        
        return {
          allowed: false,
          reason: `Usage limit exceeded for '${featureName}'. Used: ${used}/${limit}`,
          upgradeRequired: true,
          recommendedPlan: this.getRecommendedPlan(featureName),
          resetDate: subscription.limits.limitsResetDate
        };
      }
      
      return {
        allowed: true,
        subscription,
        remainingUsage: this.getRemainingUsage(subscription, featureName)
      };
      
    } catch (error) {
      console.error('❌ PREMIUM: Feature access validation error:', error.message);
      throw error;
    }
  }
  
  /**
   * REAL feature usage tracking
   */
  static async useFeature(userId, featureName, usage = 1) {
    try {
      console.log(`🔧 PREMIUM: Using feature '${featureName}' for user ${userId}`);
      
      const validation = await this.validateFeatureAccess(userId, featureName, usage);
      
      if (!validation.allowed) {
        throw new Error(validation.reason);
      }
      
      const subscription = validation.subscription;
      await subscription.useFeature(featureName, usage);
      
      console.log(`✅ PREMIUM: Feature usage recorded - ${featureName}: ${usage}`);
      
      return {
        success: true,
        usageRecorded: usage,
        remainingUsage: this.getRemainingUsage(subscription, featureName)
      };
      
    } catch (error) {
      console.error('❌ PREMIUM: Feature usage error:', error.message);
      throw error;
    }
  }
  
  /**
   * REAL subscription management
   */
  static async upgradeSubscription(userId, newPlan, billingCycle, paymentDetails) {
    try {
      console.log(`⬆️ PREMIUM: Upgrading subscription to ${newPlan} for user ${userId}`);
      
      const subscription = await Subscription.findOne({ user: userId });
      
      if (!subscription) {
        throw new Error('No existing subscription found');
      }
      
      const currentPlanLevel = this.getPlanLevel(subscription.plan);
      const newPlanLevel = this.getPlanLevel(newPlan);
      
      if (newPlanLevel <= currentPlanLevel) {
        throw new Error('Cannot upgrade to a lower or same plan level');
      }
      
      // Calculate prorated amount
      const proratedAmount = this.calculateProratedAmount(subscription, newPlan, billingCycle);
      
      if (proratedAmount > 0) {
        // Process prorated payment
        const paymentResult = await this.processPayment(proratedAmount, paymentDetails);
        
        if (!paymentResult.success) {
          throw new Error(`Upgrade payment failed: ${paymentResult.error}`);
        }
        
        // Record the payment
        subscription.billing.invoiceHistory.push({
          invoiceId: paymentResult.invoiceId,
          amount: proratedAmount,
          date: new Date(),
          status: 'paid',
          paymentGatewayId: paymentResult.transactionId
        });
      }
      
      // Apply upgrade
      await subscription.upgrade(newPlan, billingCycle);
      
      // Update user
      await User.findByIdAndUpdate(userId, {
        'premium.plan': newPlan
      });
      
      // Award upgrade points
      const pointsAwarded = this.getPointsForUpgrade(subscription.plan, newPlan);
      await RealGamificationService.awardPoints(userId, pointsAwarded, `upgrade to ${newPlan}`);
      
      console.log(`✅ PREMIUM: Subscription upgraded successfully`);
      
      return {
        subscription,
        proratedAmount,
        pointsAwarded,
        message: `Successfully upgraded to ${newPlan.toUpperCase()}!`
      };
      
    } catch (error) {
      console.error('❌ PREMIUM: Subscription upgrade error:', error.message);
      throw error;
    }
  }
  
  /**
   * REAL subscription cancellation
   */
  static async cancelSubscription(userId, reason = 'User requested', immediate = false) {
    try {
      console.log(`❌ PREMIUM: Cancelling subscription for user ${userId}`);
      
      const subscription = await Subscription.findOne({ user: userId });
      
      if (!subscription) {
        throw new Error('No subscription found');
      }
      
      if (subscription.status === 'cancelled') {
        throw new Error('Subscription is already cancelled');
      }
      
      await subscription.cancel(reason);
      
      if (immediate) {
        // Immediate cancellation - downgrade to free
        subscription.status = 'inactive';
        subscription.features = Subscription.getPlanFeatures('free');
        await subscription.save();
        
        await User.findByIdAndUpdate(userId, {
          'premium.isPremium': false,
          'premium.plan': 'free'
        });
      } else {
        // Cancel at end of billing period
        console.log(`📅 PREMIUM: Subscription will end on ${subscription.subscription.endDate}`);
      }
      
      console.log(`✅ PREMIUM: Subscription cancelled successfully`);
      
      return {
        subscription,
        immediate,
        endDate: subscription.subscription.endDate,
        message: immediate ? 
          'Subscription cancelled immediately. You now have free access.' :
          `Subscription will end on ${subscription.subscription.endDate.toDateString()}. You'll retain premium features until then.`
      };
      
    } catch (error) {
      console.error('❌ PREMIUM: Subscription cancellation error:', error.message);
      throw error;
    }
  }
  
  /**
   * REAL trial management
   */
  static async startTrial(userId, trialPlan = 'premium', trialDays = 14) {
    try {
      console.log(`🆓 PREMIUM: Starting ${trialDays}-day trial for user ${userId}`);
      
      const subscription = await Subscription.findOne({ user: userId });
      
      if (subscription && subscription.trial.hasUsedTrial) {
        throw new Error('User has already used their trial period');
      }
      
      if (subscription && subscription.isActive()) {
        throw new Error('User already has an active subscription');
      }
      
      const trialFeatures = Subscription.getPlanFeatures(trialPlan);
      const trialEndDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
      
      let updatedSubscription;
      if (subscription) {
        // Update existing subscription
        subscription.plan = trialPlan;
        subscription.status = 'trial';
        subscription.features = trialFeatures;
        subscription.trial = {
          isTrialUser: true,
          trialStartDate: new Date(),
          trialEndDate,
          trialPlan,
          hasUsedTrial: true
        };
        subscription.subscription.endDate = trialEndDate;
        updatedSubscription = await subscription.save();
      } else {
        // Create new trial subscription
        updatedSubscription = await Subscription.create({
          user: userId,
          plan: trialPlan,
          status: 'trial',
          billing: {
            cycle: 'monthly',
            amount: 0,
            paymentMethod: 'trial'
          },
          features: trialFeatures,
          trial: {
            isTrialUser: true,
            trialStartDate: new Date(),
            trialEndDate,
            trialPlan,
            hasUsedTrial: true
          },
          subscription: {
            startDate: new Date(),
            endDate: trialEndDate,
            autoRenew: false
          }
        });
      }
      
      // Update user
      await User.findByIdAndUpdate(userId, {
        'premium.isPremium': true,
        'premium.plan': trialPlan,
        'premium.subscriptionId': updatedSubscription._id,
        'premium.isTrial': true
      });
      
      // Award trial points
      await RealGamificationService.awardPoints(userId, 100, 'premium trial started');
      
      console.log(`✅ PREMIUM: Trial started successfully`);
      
      return {
        subscription: updatedSubscription,
        trialEndDate,
        daysRemaining: trialDays,
        message: `Your ${trialDays}-day ${trialPlan} trial has started! Enjoy premium features.`
      };
      
    } catch (error) {
      console.error('❌ PREMIUM: Trial start error:', error.message);
      throw error;
    }
  }
  
  /**
   * Helper methods for calculations and validations
   */
  static calculateNextBillingDate(billingCycle) {
    const now = new Date();
    if (billingCycle === 'monthly') {
      return new Date(now.setMonth(now.getMonth() + 1));
    } else if (billingCycle === 'yearly') {
      return new Date(now.setFullYear(now.getFullYear() + 1));
    }
    return new Date();
  }
  
  static calculateEndDate(billingCycle) {
    const now = new Date();
    if (billingCycle === 'monthly') {
      return new Date(now.setMonth(now.getMonth() + 1));
    } else if (billingCycle === 'yearly') {
      return new Date(now.setFullYear(now.getFullYear() + 1));
    }
    return new Date();
  }
  
  static getPlanLevel(plan) {
    const levels = { free: 0, basic: 1, premium: 2, enterprise: 3 };
    return levels[plan] || 0;
  }
  
  static getPointsForSubscription(plan) {
    const points = { basic: 1000, premium: 2500, enterprise: 5000 };
    return points[plan] || 0;
  }
  
  static getPointsForUpgrade(oldPlan, newPlan) {
    const oldLevel = this.getPlanLevel(oldPlan);
    const newLevel = this.getPlanLevel(newPlan);
    return (newLevel - oldLevel) * 500;
  }
  
  static getRecommendedPlan(featureName) {
    const featurePlanMap = {
      advancedAnalytics: 'premium',
      externalIntegrations: 'premium',
      apiAccess: 'premium',
      webhooks: 'enterprise',
      monetizationTools: 'premium'
    };
    return featurePlanMap[featureName] || 'basic';
  }
  
  static getRemainingUsage(subscription, featureName) {
    const limit = subscription.features[`max${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`];
    const used = subscription.limits[`${featureName}Used`];
    
    if (limit === -1) return 'unlimited';
    return Math.max(0, limit - used);
  }
  
  static calculateProratedAmount(subscription, newPlan, billingCycle) {
    const currentAmount = subscription.billing.amount;
    const newAmount = Subscription.getPlanPricing(newPlan, billingCycle);
    const daysSinceLastBilling = Math.floor((Date.now() - subscription.billing.lastBillingDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDaysInCycle = billingCycle === 'monthly' ? 30 : 365;
    const remainingDays = totalDaysInCycle - daysSinceLastBilling;
    
    const currentProratedRefund = (currentAmount / totalDaysInCycle) * remainingDays;
    const newProratedCharge = (newAmount / totalDaysInCycle) * remainingDays;
    
    return Math.max(0, newProratedCharge - currentProratedRefund);
  }
  
  static async simulatePaymentDelay() {
    // Simulate realistic payment processing time
    const delay = Math.random() * 2000 + 500; // 500-2500ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  static validateCreditCard(cardNumber) {
    // Basic Luhn algorithm validation
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
  
  static checkFeatureLimit(features, featureName, requestedUsage) {
    const limit = features[`max${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`];
    
    if (limit === undefined || limit === false) {
      return {
        allowed: false,
        reason: `Feature '${featureName}' is not available in the free plan`,
        upgradeRequired: true,
        recommendedPlan: 'basic'
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Get subscription analytics
   */
  static async getSubscriptionAnalytics(startDate, endDate) {
    try {
      console.log(`📊 PREMIUM: Getting subscription analytics`);
      
      const analytics = await Subscription.aggregate([
        {
          $facet: {
            totalSubscribers: [
              { $match: { status: 'active' } },
              { $count: 'count' }
            ],
            revenueByPlan: [
              {
                $match: {
                  'billing.lastBillingDate': { $gte: startDate, $lte: endDate },
                  status: 'active'
                }
              },
              {
                $group: {
                  _id: '$plan',
                  totalRevenue: { $sum: '$billing.amount' },
                  subscriberCount: { $sum: 1 }
                }
              }
            ],
            churnRate: [
              {
                $match: {
                  status: 'cancelled',
                  'subscription.cancelationDate': { $gte: startDate, $lte: endDate }
                }
              },
              { $count: 'churned' }
            ],
            trialConversions: [
              {
                $match: {
                  'trial.hasUsedTrial': true,
                  status: 'active',
                  plan: { $ne: 'free' }
                }
              },
              { $count: 'conversions' }
            ]
          }
        }
      ]);
      
      console.log(`✅ PREMIUM: Analytics retrieved successfully`);
      
      return analytics[0];
      
    } catch (error) {
      console.error('❌ PREMIUM: Analytics error:', error.message);
      throw error;
    }
  }
}

module.exports = RealPremiumService;