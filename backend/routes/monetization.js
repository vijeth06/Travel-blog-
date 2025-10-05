const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const subscriptionService = require('../services/subscriptionService');
const affiliateService = require('../services/affiliateService');
const sponsoredContentService = require('../services/sponsoredContentService');
const { SubscriptionPlan, UserSubscription, AffiliateProgram, SponsoredContent } = require('../models/Monetization');

// Subscription Plans Routes
router.get('/subscription-plans', async (req, res) => {
  try {
    const plans = await subscriptionService.getSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
});

router.post('/subscription-plans', adminAuth, async (req, res) => {
  try {
    const plan = await subscriptionService.createSubscriptionPlan(req.body);
    res.status(201).json(plan);
  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({ error: 'Failed to create subscription plan' });
  }
});

// User Subscription Routes
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { planId, billingCycle, paymentMethodId } = req.body;
    
    const subscription = await subscriptionService.subscribeUser(
      req.user.id,
      planId,
      billingCycle,
      paymentMethodId
    );
    
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/subscription', protect, async (req, res) => {
  try {
    const subscription = await subscriptionService.getUserSubscription(req.user.id);
    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

router.post('/cancel-subscription', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const subscription = await subscriptionService.cancelSubscription(req.user.id, reason);
    res.json(subscription);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/update-subscription', protect, async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const subscription = await subscriptionService.updateSubscription(
      req.user.id,
      planId,
      billingCycle
    );
    res.json(subscription);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/usage-limits/:featureType', protect, async (req, res) => {
  try {
    const { featureType } = req.params;
    const limits = await subscriptionService.checkUsageLimit(req.user.id, featureType);
    res.json(limits);
  } catch (error) {
    console.error('Check usage limits error:', error);
    res.status(500).json({ error: 'Failed to check usage limits' });
  }
});

// Affiliate Program Routes
router.get('/affiliate-programs', async (req, res) => {
  try {
    const programs = await affiliateService.getActivePrograms();
    res.json(programs);
  } catch (error) {
    console.error('Get affiliate programs error:', error);
    res.status(500).json({ error: 'Failed to get affiliate programs' });
  }
});

router.post('/affiliate-programs', adminAuth, async (req, res) => {
  try {
    const program = await affiliateService.createProgram(req.body);
    res.status(201).json(program);
  } catch (error) {
    console.error('Create affiliate program error:', error);
    res.status(500).json({ error: 'Failed to create affiliate program' });
  }
});

router.post('/affiliate/join/:programId', protect, async (req, res) => {
  try {
    const { programId } = req.params;
    const application = await affiliateService.joinProgram(req.user.id, programId);
    res.status(201).json(application);
  } catch (error) {
    console.error('Join affiliate program error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/affiliate/dashboard', protect, async (req, res) => {
  try {
    const dashboard = await affiliateService.getAffiliateDashboard(req.user.id);
    res.json(dashboard);
  } catch (error) {
    console.error('Get affiliate dashboard error:', error);
    res.status(500).json({ error: 'Failed to get affiliate dashboard' });
  }
});

router.post('/affiliate/links', protect, async (req, res) => {
  try {
    const { programId, targetUrl, customCode } = req.body;
    const link = await affiliateService.createAffiliateLink(
      req.user.id,
      programId,
      targetUrl,
      customCode
    );
    res.status(201).json(link);
  } catch (error) {
    console.error('Create affiliate link error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/affiliate/links', protect, async (req, res) => {
  try {
    const links = await affiliateService.getUserAffiliateLinks(req.user.id);
    res.json(links);
  } catch (error) {
    console.error('Get affiliate links error:', error);
    res.status(500).json({ error: 'Failed to get affiliate links' });
  }
});

router.get('/affiliate/analytics', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await affiliateService.getAffiliateAnalytics(
      req.user.id,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    res.json(analytics);
  } catch (error) {
    console.error('Get affiliate analytics error:', error);
    res.status(500).json({ error: 'Failed to get affiliate analytics' });
  }
});

// Admin Affiliate Management
router.get('/admin/affiliate/applications', adminAuth, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const applications = await affiliateService.getPendingApplications(status);
    res.json(applications);
  } catch (error) {
    console.error('Get affiliate applications error:', error);
    res.status(500).json({ error: 'Failed to get affiliate applications' });
  }
});

router.post('/admin/affiliate/approve/:applicationId', adminAuth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;
    const application = await affiliateService.approveApplication(applicationId, req.user.id, notes);
    res.json(application);
  } catch (error) {
    console.error('Approve affiliate application error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/admin/affiliate/reject/:applicationId', adminAuth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;
    const application = await affiliateService.rejectApplication(applicationId, req.user.id, reason);
    res.json(application);
  } catch (error) {
    console.error('Reject affiliate application error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Sponsored Content Routes
router.post('/sponsored-content', protect, async (req, res) => {
  try {
    const campaign = await sponsoredContentService.createCampaign(req.body, req.user.id);
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create sponsored content error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/sponsored-content/active', async (req, res) => {
  try {
    const { location, category, demographics } = req.query;
    
    const targeting = {};
    if (location) targeting.location = location;
    if (category) targeting.category = category;
    if (demographics) targeting.demographics = JSON.parse(demographics);
    
    const campaigns = await sponsoredContentService.getActiveCampaigns(targeting);
    res.json(campaigns);
  } catch (error) {
    console.error('Get active sponsored content error:', error);
    res.status(500).json({ error: 'Failed to get active sponsored content' });
  }
});

router.post('/sponsored-content/:campaignId/impression', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user?.id || null;
    const metadata = {
      userAgent: req.get('User-Agent'),
      location: req.get('CF-IPCountry') || req.ip,
      referrer: req.get('Referrer'),
      deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
    };
    
    await sponsoredContentService.recordImpression(campaignId, userId, metadata);
    res.json({ success: true });
  } catch (error) {
    console.error('Record impression error:', error);
    res.status(500).json({ error: 'Failed to record impression' });
  }
});

router.post('/sponsored-content/:campaignId/click', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user?.id || null;
    const metadata = {
      userAgent: req.get('User-Agent'),
      location: req.get('CF-IPCountry') || req.ip,
      referrer: req.get('Referrer'),
      deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
    };
    
    await sponsoredContentService.recordClick(campaignId, userId, metadata);
    res.json({ success: true });
  } catch (error) {
    console.error('Record click error:', error);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

router.post('/sponsored-content/:campaignId/conversion', protect, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { conversionType, value } = req.body;
    
    await sponsoredContentService.recordConversion(
      campaignId,
      req.user.id,
      conversionType,
      value
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Record conversion error:', error);
    res.status(500).json({ error: 'Failed to record conversion' });
  }
});

router.get('/sponsored-content/:campaignId/analytics', protect, async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Check if user owns the campaign or is admin
    const campaign = await SponsoredContent.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const analytics = await sponsoredContentService.getCampaignAnalytics(campaignId);
    res.json(analytics);
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    res.status(500).json({ error: 'Failed to get campaign analytics' });
  }
});

// Admin Sponsored Content Management
router.get('/admin/sponsored-content', adminAuth, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const campaigns = await SponsoredContent.find({ status })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Get sponsored content campaigns error:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

router.post('/admin/sponsored-content/:campaignId/approve', adminAuth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { notes } = req.body;
    
    const campaign = await sponsoredContentService.approveCampaign(
      campaignId,
      req.user.id,
      notes
    );
    res.json(campaign);
  } catch (error) {
    console.error('Approve campaign error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/admin/sponsored-content/:campaignId/reject', adminAuth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { reason } = req.body;
    
    const campaign = await sponsoredContentService.rejectCampaign(
      campaignId,
      req.user.id,
      reason
    );
    res.json(campaign);
  } catch (error) {
    console.error('Reject campaign error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/admin/sponsored-content/:campaignId/activate', adminAuth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await sponsoredContentService.activateCampaign(campaignId);
    res.json(campaign);
  } catch (error) {
    console.error('Activate campaign error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Stripe Webhooks
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await subscriptionService.handleStripeWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Affiliate Click Tracking (Public Route)
router.get('/aff/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const redirectUrl = await affiliateService.trackClick(
      code,
      req.ip,
      req.get('User-Agent'),
      req.get('Referrer')
    );
    
    if (redirectUrl) {
      res.redirect(302, redirectUrl);
    } else {
      res.status(404).json({ error: 'Affiliate link not found' });
    }
  } catch (error) {
    console.error('Affiliate click tracking error:', error);
    res.status(500).json({ error: 'Link tracking failed' });
  }
});

// Revenue Analytics (Admin Only)
router.get('/admin/revenue/analytics', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Calculate subscription revenue
    const subscriptionRevenue = await UserSubscription.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate ? new Date(startDate) : new Date('2020-01-01'),
            $lte: endDate ? new Date(endDate) : new Date()
          }
        }
      },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: 'plan',
          foreignField: '_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$plan'
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$billingCycle', 'monthly'] },
                '$plan.pricing.monthly.amount',
                {
                  $cond: [
                    { $eq: ['$billingCycle', 'yearly'] },
                    '$plan.pricing.yearly.amount',
                    '$plan.pricing.lifetime.amount'
                  ]
                }
              ]
            }
          },
          subscriptionCount: { $sum: 1 }
        }
      }
    ]);

    // Calculate affiliate commissions paid
    const affiliateRevenue = await affiliateService.getRevenueAnalytics(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    // Calculate sponsored content revenue
    const sponsoredRevenue = await SponsoredContent.aggregate([
      {
        $match: {
          status: 'active',
          createdAt: {
            $gte: startDate ? new Date(startDate) : new Date('2020-01-01'),
            $lte: endDate ? new Date(endDate) : new Date()
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$performance.totalCost' },
          campaignCount: { $sum: 1 }
        }
      }
    ]);

    const analytics = {
      subscriptions: subscriptionRevenue[0] || { totalRevenue: 0, subscriptionCount: 0 },
      affiliates: affiliateRevenue,
      sponsoredContent: sponsoredRevenue[0] || { totalRevenue: 0, campaignCount: 0 },
      totalRevenue: (subscriptionRevenue[0]?.totalRevenue || 0) + 
                   (sponsoredRevenue[0]?.totalRevenue || 0) - 
                   (affiliateRevenue?.totalCommissionsPaid || 0)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to get revenue analytics' });
  }
});

module.exports = router;
