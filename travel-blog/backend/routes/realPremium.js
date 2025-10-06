const express = require('express');
const router = express.Router();
const RealPremiumControllerClass = require('../controllers/realPremiumController');
const RealPremiumController = new RealPremiumControllerClass();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for premium operations
const premiumRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 premium requests per windowMs
  message: {
    success: false,
    message: 'Too many premium requests, please try again later'
  }
});

// Rate limiting for payment operations (more restrictive)
const paymentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 payment attempts per hour
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later'
  }
});

/**
 * @route   GET /api/premium/plans
 * @desc    Get available subscription plans with pricing and features
 * @access  Public
 * @example GET /api/premium/plans
 */
router.get('/plans', RealPremiumController.getPlans.bind(RealPremiumController));

/**
 * @route   GET /api/premium/subscription
 * @desc    Get user's current subscription details
 * @access  Private
 * @example GET /api/premium/subscription
 */
router.get('/subscription', auth, RealPremiumController.getCurrentSubscription.bind(RealPremiumController));

/**
 * @route   POST /api/premium/subscribe
 * @desc    Create a new subscription with payment processing
 * @access  Private
 * @example POST /api/premium/subscribe
 * @body    { plan: "premium", billingCycle: "yearly", paymentDetails: {...} }
 */
router.post('/subscribe', 
  auth, 
  paymentRateLimit, 
  RealPremiumController.createSubscription.bind(RealPremiumController)
);

/**
 * @route   PUT /api/premium/upgrade
 * @desc    Upgrade existing subscription to a higher plan
 * @access  Private
 * @example PUT /api/premium/upgrade
 * @body    { newPlan: "enterprise", billingCycle: "yearly", paymentDetails: {...} }
 */
router.put('/upgrade', 
  auth, 
  paymentRateLimit, 
  RealPremiumController.upgradeSubscription.bind(RealPremiumController)
);

/**
 * @route   POST /api/premium/cancel
 * @desc    Cancel subscription (immediate or at end of billing period)
 * @access  Private
 * @example POST /api/premium/cancel
 * @body    { reason: "Too expensive", immediate: false }
 */
router.post('/cancel', 
  auth, 
  premiumRateLimit, 
  RealPremiumController.cancelSubscription.bind(RealPremiumController)
);

/**
 * @route   POST /api/premium/trial
 * @desc    Start free trial for premium features
 * @access  Private
 * @example POST /api/premium/trial
 * @body    { trialPlan: "premium", trialDays: 14 }
 */
router.post('/trial', 
  auth, 
  premiumRateLimit, 
  RealPremiumController.startTrial.bind(RealPremiumController)
);

/**
 * @route   GET /api/premium/feature/validate
 * @desc    Validate access to a specific premium feature
 * @access  Private
 * @example GET /api/premium/feature/validate?feature=advancedAnalytics&usage=1
 */
router.get('/feature/validate', 
  auth, 
  RealPremiumController.validateFeature.bind(RealPremiumController)
);

/**
 * @route   POST /api/premium/feature/use
 * @desc    Record usage of a premium feature (with limit tracking)
 * @access  Private
 * @example POST /api/premium/feature/use
 * @body    { feature: "blogs", usage: 1 }
 */
router.post('/feature/use', 
  auth, 
  premiumRateLimit, 
  RealPremiumController.useFeature.bind(RealPremiumController)
);

/**
 * @route   GET /api/premium/analytics
 * @desc    Get subscription analytics and metrics (admin only)
 * @access  Private (Admin)
 * @example GET /api/premium/analytics?startDate=2024-01-01&endDate=2024-12-31
 */
router.get('/analytics', 
  auth, 
  // TODO: Add admin middleware
  RealPremiumController.getAnalytics.bind(RealPremiumController)
);

/**
 * @route   POST /api/premium/webhook
 * @desc    Handle payment gateway webhooks for subscription events
 * @access  Public (webhook endpoint)
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('💳 WEBHOOK: Received payment event:', event);
    
    // Handle different webhook events
    switch (event) {
      case 'payment.succeeded':
        // Handle successful payment
        console.log('✅ WEBHOOK: Payment succeeded:', data.transactionId);
        break;
        
      case 'payment.failed':
        // Handle failed payment
        console.log('❌ WEBHOOK: Payment failed:', data.transactionId);
        break;
        
      case 'subscription.renewed':
        // Handle subscription renewal
        console.log('🔄 WEBHOOK: Subscription renewed:', data.subscriptionId);
        break;
        
      case 'subscription.cancelled':
        // Handle subscription cancellation
        console.log('❌ WEBHOOK: Subscription cancelled:', data.subscriptionId);
        break;
        
      default:
        console.log('❓ WEBHOOK: Unknown event type:', event);
    }
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
    
  } catch (error) {
    console.error('❌ WEBHOOK: Processing error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

/**
 * @route   POST /api/premium/coupon/validate
 * @desc    Validate and apply discount coupon
 * @access  Private
 */
router.post('/coupon/validate', auth, async (req, res) => {
  try {
    const { couponCode } = req.body;
    
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }
    
    // Simulate coupon validation
    const validCoupons = {
      'WELCOME20': { discount: 20, type: 'percentage', validUntil: '2025-12-31' },
      'SAVE50': { discount: 50, type: 'amount', validUntil: '2025-06-30' },
      'STUDENT30': { discount: 30, type: 'percentage', validUntil: '2025-12-31' },
      'TRIAL2PREMIUM': { discount: 15, type: 'percentage', validUntil: '2025-12-31' }
    };
    
    const coupon = validCoupons[couponCode.toUpperCase()];
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }
    
    if (new Date() > new Date(coupon.validUntil)) {
      return res.status(410).json({
        success: false,
        message: 'Coupon has expired'
      });
    }
    
    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        coupon: {
          code: couponCode.toUpperCase(),
          discount: coupon.discount,
          type: coupon.type,
          validUntil: coupon.validUntil
        },
        description: `${coupon.discount}${coupon.type === 'percentage' ? '%' : ' USD'} off your subscription`
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/premium/compare
 * @desc    Get detailed plan comparison
 * @access  Public
 */
router.get('/compare', (req, res) => {
  try {
    const comparison = {
      features: [
        {
          category: 'Content Creation',
          features: [
            { name: 'Blog Posts', free: '5', basic: '25', premium: '100', enterprise: 'Unlimited' },
            { name: 'Photo Storage', free: '50', basic: '500', premium: '2,000', enterprise: 'Unlimited' },
            { name: 'Video Storage', free: '0', basic: '10', premium: '50', enterprise: 'Unlimited' },
            { name: 'Advanced Editor', free: false, basic: true, premium: true, enterprise: true },
            { name: 'Custom Themes', free: false, basic: true, premium: true, enterprise: true }
          ]
        },
        {
          category: 'Analytics & Insights',
          features: [
            { name: 'Basic Analytics', free: false, basic: true, premium: true, enterprise: true },
            { name: 'Advanced Analytics', free: false, basic: false, premium: true, enterprise: true },
            { name: 'Export Data', free: false, basic: false, premium: true, enterprise: true },
            { name: 'AI Insights', free: false, basic: true, premium: true, enterprise: true }
          ]
        },
        {
          category: 'Integrations',
          features: [
            { name: 'External Integrations', free: false, basic: false, premium: true, enterprise: true },
            { name: 'API Access', free: false, basic: false, premium: true, enterprise: true },
            { name: 'Webhooks', free: false, basic: false, premium: false, enterprise: true },
            { name: 'White-label', free: false, basic: false, premium: false, enterprise: true }
          ]
        },
        {
          category: 'Support',
          features: [
            { name: 'Community Support', free: true, basic: true, premium: true, enterprise: true },
            { name: 'Email Support', free: false, basic: true, premium: true, enterprise: true },
            { name: 'Priority Support', free: false, basic: false, premium: true, enterprise: true },
            { name: 'Dedicated Manager', free: false, basic: false, premium: false, enterprise: true }
          ]
        }
      ],
      recommendations: {
        beginner: 'free',
        hobbyist: 'basic',
        professional: 'premium',
        business: 'enterprise'
      }
    };
    
    res.json({
      success: true,
      message: 'Plan comparison retrieved successfully',
      data: comparison
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get plan comparison',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/premium/health
 * @desc    Health check for premium service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Premium Service is operational',
    data: {
      status: 'healthy',
      version: '1.0.0',
      features: [
        'Subscription management',
        'Payment processing',
        'Feature access control',
        'Usage tracking',
        'Trial management',
        'Billing automation',
        'Analytics and reporting'
      ],
      paymentGateways: ['stripe', 'paypal'],
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
      uptime: process.uptime(),
      timestamp: new Date()
    }
  });
});

module.exports = router;