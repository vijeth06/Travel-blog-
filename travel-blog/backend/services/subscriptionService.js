const { SubscriptionPlan, UserSubscription } = require('../models/Monetization');
const User = require('../models/User');
const { sendEmail } = require('./emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class SubscriptionService {
  constructor() {
    this.trialPeriodDays = 7;
    this.gracePeriodDays = 3; // Grace period for failed payments
  }

  async createSubscriptionPlan(planData) {
    try {
      // Create Stripe product first
      const stripeProduct = await stripe.products.create({
        name: planData.displayName || planData.name,
        description: planData.description,
        metadata: {
          planId: 'pending' // Will update after saving to DB
        }
      });

      // Create Stripe prices for different billing cycles
      const stripePrices = {};

      if (planData.pricing.monthly) {
        stripePrices.monthly = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(planData.pricing.monthly.amount * 100), // Convert to cents
          currency: planData.pricing.monthly.currency.toLowerCase(),
          recurring: { interval: 'month' },
          metadata: { billingCycle: 'monthly' }
        });
      }

      if (planData.pricing.yearly) {
        stripePrices.yearly = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(planData.pricing.yearly.amount * 100),
          currency: planData.pricing.yearly.currency.toLowerCase(),
          recurring: { interval: 'year' },
          metadata: { billingCycle: 'yearly' }
        });   
      }

      if (planData.pricing.lifetime) {
        stripePrices.lifetime = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(planData.pricing.lifetime.amount * 100),
          currency: planData.pricing.lifetime.currency.toLowerCase(),
          metadata: { billingCycle: 'lifetime' }
        });
      }

      // Create subscription plan in database
      const subscriptionPlan = new SubscriptionPlan({
        ...planData,
        stripeProductId: stripeProduct.id,
        stripePriceIds: {
          monthly: stripePrices.monthly?.id,
          yearly: stripePrices.yearly?.id,
          lifetime: stripePrices.lifetime?.id
        }
      });

      await subscriptionPlan.save();

      // Update Stripe product metadata with actual plan ID
      await stripe.products.update(stripeProduct.id, {
        metadata: { planId: subscriptionPlan._id.toString() }
      });

      return subscriptionPlan;
    } catch (error) {
      console.error('Create subscription plan error:', error);
      throw new Error('Failed to create subscription plan');
    }
  }

  async subscribeUser(userId, planId, billingCycle, paymentMethodId = null) {
    try {
      const user = await User.findById(userId);
      const plan = await SubscriptionPlan.findById(planId);

      if (!user || !plan) {
        throw new Error('User or plan not found');
      }

      if (!plan.isActive) {
        throw new Error('Subscription plan is not active');
      }

      // Check if user already has an active subscription
      const existingSubscription = await UserSubscription.findOne({
        user: userId,
        status: { $in: ['trial', 'active'] }
      });

      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      // Create or retrieve Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: userId.toString() }
        });
        stripeCustomerId = stripeCustomer.id;
        
        // Update user with Stripe customer ID
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
      }

      // Attach payment method if provided
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: stripeCustomerId
        });

        // Set as default payment method
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }

      let stripeSubscriptionId = null;
      let startDate = new Date();
      let endDate = null;
      let trialEndDate = null;

      // Handle different billing cycles
      if (billingCycle === 'lifetime') {
        // For lifetime subscriptions, create a one-time payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(plan.pricing.lifetime.amount * 100),
          currency: plan.pricing.lifetime.currency.toLowerCase(),
          customer: stripeCustomerId,
          payment_method: paymentMethodId,
          confirm: paymentMethodId ? true : false,
          description: `Lifetime subscription to ${plan.displayName}`,
          metadata: {
            userId: userId.toString(),
            planId: planId.toString(),
            billingCycle: 'lifetime'
          }
        });

        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_action') {
          throw new Error('Payment failed');
        }

        endDate = new Date('2099-12-31'); // Far future date for lifetime
      } else {
        // Create recurring subscription
        const priceId = plan.stripePriceIds[billingCycle];
        if (!priceId) {
          throw new Error(`${billingCycle} billing not available for this plan`);
        }

        const subscriptionData = {
          customer: stripeCustomerId,
          items: [{ price: priceId }],
          metadata: {
            userId: userId.toString(),
            planId: planId.toString()
          }
        };

        // Add trial period if enabled
        if (plan.trialPeriod.enabled) {
          trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + plan.trialPeriod.duration);
          subscriptionData.trial_end = Math.floor(trialEndDate.getTime() / 1000);
        }

        const stripeSubscription = await stripe.subscriptions.create(subscriptionData);
        stripeSubscriptionId = stripeSubscription.id;

        // Calculate end date based on billing cycle
        endDate = new Date();
        if (billingCycle === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (billingCycle === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
      }

      // Create user subscription record
      const userSubscription = new UserSubscription({
        user: userId,
        plan: planId,
        status: plan.trialPeriod.enabled ? 'trial' : 'active',
        billingCycle,
        startDate,
        endDate,
        trialEndDate,
        stripeSubscriptionId,
        stripeCustomerId,
        usage: {
          resetDate: billingCycle === 'monthly' ? 
            new Date(endDate.getFullYear(), endDate.getMonth(), 1) : 
            new Date(endDate.getFullYear(), 0, 1)
        }
      });

      await userSubscription.save();

      // Send welcome email
      await sendEmail({
        to: user.email,
        subject: `Welcome to ${plan.displayName}! 🎉`,
        template: 'subscription-welcome',
        data: {
          userName: user.name,
          planName: plan.displayName,
          billingCycle,
          trialEndDate: trialEndDate,
          features: plan.features
        }
      });

      return userSubscription;
    } catch (error) {
      console.error('Subscribe user error:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async cancelSubscription(userId, reason = null) {
    try {
      const subscription = await UserSubscription.findOne({
        user: userId,
        status: { $in: ['trial', 'active'] }
      }).populate('plan');

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Cancel Stripe subscription if it exists
      if (subscription.stripeSubscriptionId) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
      }

      // Update subscription status
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      
      if (reason) {
        subscription.cancellation = {
          reason,
          cancelledBy: 'user'
        };
      }

      await subscription.save();

      // Send cancellation confirmation
      const user = await User.findById(userId);
      await sendEmail({
        to: user.email,
        subject: 'Subscription Cancellation Confirmed',
        template: 'subscription-cancelled',
        data: {
          userName: user.name,
          planName: subscription.plan.displayName,
          endDate: subscription.endDate
        }
      });

      return subscription;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async updateSubscription(userId, newPlanId, newBillingCycle) {
    try {
      const currentSubscription = await UserSubscription.findOne({
        user: userId,
        status: { $in: ['trial', 'active'] }
      });

      const newPlan = await SubscriptionPlan.findById(newPlanId);

      if (!currentSubscription || !newPlan) {
        throw new Error('Current subscription or new plan not found');
      }

      // Update Stripe subscription
      if (currentSubscription.stripeSubscriptionId) {
        const newPriceId = newPlan.stripePriceIds[newBillingCycle];
        
        await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
          items: [{
            id: (await stripe.subscriptions.retrieve(currentSubscription.stripeSubscriptionId)).items.data[0].id,
            price: newPriceId
          }],
          proration_behavior: 'create_prorations'
        });
      }

      // Update subscription record
      currentSubscription.plan = newPlanId;
      currentSubscription.billingCycle = newBillingCycle;

      // Reset usage counters
      currentSubscription.usage = {
        blogPosts: 0,
        videoUploads: 0,
        photo360s: 0,
        packagesCreated: 0,
        apiCalls: 0,
        resetDate: new Date()
      };

      await currentSubscription.save();

      return currentSubscription;
    } catch (error) {
      console.error('Update subscription error:', error);
      throw new Error('Failed to update subscription');
    }
  }

  async checkUsageLimit(userId, featureType) {
    try {
      const subscription = await UserSubscription.findOne({
        user: userId,
        status: { $in: ['trial', 'active'] }
      }).populate('plan');

      if (!subscription) {
        // No subscription - use free tier limits
        return { allowed: false, limit: 0, current: 0 };
      }

      const plan = subscription.plan;
      const usage = subscription.usage;
      
      let limit = -1; // -1 means unlimited
      let current = 0;

      switch (featureType) {
        case 'blogPost':
          limit = plan.features.blogPostLimit;
          current = usage.blogPosts;
          break;
        case 'videoUpload':
          limit = plan.features.videoUploadLimit;
          current = usage.videoUploads;
          break;
        case 'photo360':
          limit = plan.features.photo360Limit;
          current = usage.photo360s;
          break;
        case 'packageCreation':
          limit = plan.features.packageCreationLimit;
          current = usage.packagesCreated;
          break;
        case 'apiCall':
          limit = 1000; // Default API limit
          current = usage.apiCalls;
          break;
      }

      const allowed = limit === -1 || current < limit;

      return { allowed, limit, current };
    } catch (error) {
      console.error('Check usage limit error:', error);
      throw new Error('Failed to check usage limits');
    }
  }

  async updateUsage(userId, featureType, increment = 1) {
    try {
      const subscription = await UserSubscription.findOne({
        user: userId,
        status: { $in: ['trial', 'active'] }
      });

      if (!subscription) {
        return; // No subscription to track usage
      }

      switch (featureType) {
        case 'blogPost':
          subscription.usage.blogPosts += increment;
          break;
        case 'videoUpload':
          subscription.usage.videoUploads += increment;
          break;
        case 'photo360':
          subscription.usage.photo360s += increment;
          break;
        case 'packageCreation':
          subscription.usage.packagesCreated += increment;
          break;
        case 'apiCall':
          subscription.usage.apiCalls += increment;
          break;
      }

      await subscription.save();
    } catch (error) {
      console.error('Update usage error:', error);
      // Don't throw error to avoid blocking user actions
    }
  }

  async getUserSubscription(userId) {
    try {
      const subscription = await UserSubscription.findOne({
        user: userId,
        status: { $in: ['trial', 'active', 'cancelled'] }
      })
      .populate('plan')
      .sort({ createdAt: -1 });

      return subscription;
    } catch (error) {
      console.error('Get user subscription error:', error);
      throw new Error('Failed to get user subscription');
    }
  }

  async getSubscriptionPlans(includeInactive = false) {
    try {
      const query = includeInactive ? {} : { isActive: true, isPublic: true };
      
      const plans = await SubscriptionPlan.find(query)
        .sort({ 'pricing.monthly.amount': 1 });

      return plans;
    } catch (error) {
      console.error('Get subscription plans error:', error);
      throw new Error('Failed to get subscription plans');
    }
  }

  async handleStripeWebhook(event) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
      }
    } catch (error) {
      console.error('Handle Stripe webhook error:', error);
      throw error;
    }
  }

  async handlePaymentSucceeded(invoice) {
    try {
      const subscription = await UserSubscription.findOne({
        stripeSubscriptionId: invoice.subscription
      }).populate('user').populate('plan');

      if (!subscription) return;

      // Record payment
      subscription.payments.push({
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        date: new Date(invoice.created * 1000),
        stripePaymentIntentId: invoice.payment_intent,
        status: 'succeeded',
        description: `Payment for ${subscription.plan.displayName}`
      });

      // Update subscription status if needed
      if (subscription.status === 'past_due') {
        subscription.status = 'active';
      }

      await subscription.save();

      // Send payment confirmation
      await sendEmail({
        to: subscription.user.email,
        subject: 'Payment Received - Subscription Active',
        template: 'payment-success',
        data: {
          userName: subscription.user.name,
          amount: (invoice.amount_paid / 100).toFixed(2),
          currency: invoice.currency.toUpperCase(),
          planName: subscription.plan.displayName
        }
      });
    } catch (error) {
      console.error('Handle payment succeeded error:', error);
    }
  }

  async handlePaymentFailed(invoice) {
    try {
      const subscription = await UserSubscription.findOne({
        stripeSubscriptionId: invoice.subscription
      }).populate('user').populate('plan');

      if (!subscription) return;

      subscription.status = 'past_due';
      await subscription.save();

      // Send payment failed notification
      await sendEmail({
        to: subscription.user.email,
        subject: 'Payment Failed - Action Required',
        template: 'payment-failed',
        data: {
          userName: subscription.user.name,
          amount: (invoice.amount_due / 100).toFixed(2),
          currency: invoice.currency.toUpperCase(),
          planName: subscription.plan.displayName,
          updatePaymentUrl: `/account/billing`
        }
      });
    } catch (error) {
      console.error('Handle payment failed error:', error);
    }
  }

  async handleSubscriptionDeleted(stripeSubscription) {
    try {
      const subscription = await UserSubscription.findOne({
        stripeSubscriptionId: stripeSubscription.id
      });

      if (subscription) {
        subscription.status = 'expired';
        await subscription.save();
      }
    } catch (error) {
      console.error('Handle subscription deleted error:', error);
    }
  }

  async handleSubscriptionUpdated(stripeSubscription) {
    try {
      const subscription = await UserSubscription.findOne({
        stripeSubscriptionId: stripeSubscription.id
      });

      if (subscription) {
        // Update end date based on current period
        subscription.endDate = new Date(stripeSubscription.current_period_end * 1000);
        await subscription.save();
      }
    } catch (error) {
      console.error('Handle subscription updated error:', error);
    }
  }
}

module.exports = new SubscriptionService();