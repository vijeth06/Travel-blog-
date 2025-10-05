const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const subscriptionService = require('../services/subscriptionService');
const affiliateService = require('../services/affiliateService');
const sponsoredContentService = require('../services/sponsoredContentService');
const { 
  SubscriptionPlan, 
  UserSubscription, 
  AffiliateProgram, 
  AffiliateUser,
  SponsoredContent 
} = require('../models/Monetization');

// Subscription Management Controller
class SubscriptionController {
  // Get all subscription plans
  async getPlans(req, res) {
    try {
      const plans = await subscriptionService.getSubscriptionPlans();
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Get subscription plans error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription plans'
      });
    }
  }

  // Create new subscription plan (Admin only)
  async createPlan(req, res) {
    try {
      const planData = {
        name: req.body.name,
        displayName: req.body.displayName,
        description: req.body.description,
        pricing: req.body.pricing,
        features: req.body.features,
        trialPeriod: req.body.trialPeriod || { enabled: false },
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true
      };

      const plan = await subscriptionService.createSubscriptionPlan(planData);
      
      res.status(201).json({
        success: true,
        message: 'Subscription plan created successfully',
        data: plan
      });
    } catch (error) {
      console.error('Create subscription plan error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create subscription plan'
      });
    }
  }

  // Subscribe user to a plan
  async subscribe(req, res) {
    try {
      const { planId, billingCycle, paymentMethodId } = req.body;

      if (!planId || !billingCycle) {
        return res.status(400).json({
          success: false,
          error: 'Plan ID and billing cycle are required'
        });
      }

      const subscription = await subscriptionService.subscribeUser(
        req.user.id,
        planId,
        billingCycle,
        paymentMethodId
      );

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Subscribe error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create subscription'
      });
    }
  }

  // Get user's current subscription
  async getUserSubscription(req, res) {
    try {
      const subscription = await subscriptionService.getUserSubscription(req.user.id);
      
      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Get user subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription'
      });
    }
  }

  // Cancel user subscription
  async cancelSubscription(req, res) {
    try {
      const { reason } = req.body;
      
      const subscription = await subscriptionService.cancelSubscription(
        req.user.id,
        reason
      );

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to cancel subscription'
      });
    }
  }

  // Update subscription
  async updateSubscription(req, res) {
    try {
      const { planId, billingCycle } = req.body;

      if (!planId || !billingCycle) {
        return res.status(400).json({
          success: false,
          error: 'Plan ID and billing cycle are required'
        });
      }

      const subscription = await subscriptionService.updateSubscription(
        req.user.id,
        planId,
        billingCycle
      );

      res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update subscription'
      });
    }
  }

  // Check usage limits for a feature
  async checkUsageLimits(req, res) {
    try {
      const { featureType } = req.params;
      
      const limits = await subscriptionService.checkUsageLimit(
        req.user.id,
        featureType
      );

      res.json({
        success: true,
        data: limits
      });
    } catch (error) {
      console.error('Check usage limits error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check usage limits'
      });
    }
  }
}

// Affiliate Management Controller
class AffiliateController {
  // Get active affiliate programs
  async getPrograms(req, res) {
    try {
      const programs = await affiliateService.getActivePrograms();
      
      res.json({
        success: true,
        data: programs
      });
    } catch (error) {
      console.error('Get affiliate programs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get affiliate programs'
      });
    }
  }

  // Create new affiliate program (Admin only)
  async createProgram(req, res) {
    try {
      const programData = {
        name: req.body.name,
        description: req.body.description,
        commissionRate: req.body.commissionRate,
        commissionType: req.body.commissionType || 'percentage',
        cookieDuration: req.body.cookieDuration || 30,
        minimumPayout: req.body.minimumPayout || 50,
        categories: req.body.categories || [],
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        autoApprove: req.body.autoApprove || false
      };

      const program = await affiliateService.createProgram(programData);
      
      res.status(201).json({
        success: true,
        message: 'Affiliate program created successfully',
        data: program
      });
    } catch (error) {
      console.error('Create affiliate program error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create affiliate program'
      });
    }
  }

  // Join affiliate program
  async joinProgram(req, res) {
    try {
      const { programId } = req.params;
      const { website, trafficSources, monthlyVisitors, marketingMethods } = req.body;

      const applicationData = {
        website,
        trafficSources,
        monthlyVisitors,
        marketingMethods
      };

      const application = await affiliateService.joinProgram(
        req.user.id,
        programId,
        applicationData
      );

      res.status(201).json({
        success: true,
        message: 'Affiliate application submitted successfully',
        data: application
      });
    } catch (error) {
      console.error('Join affiliate program error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to join affiliate program'
      });
    }
  }

  // Get affiliate dashboard data
  async getDashboard(req, res) {
    try {
      const dashboard = await affiliateService.getAffiliateDashboard(req.user.id);
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get affiliate dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get affiliate dashboard'
      });
    }
  }

  // Create affiliate link
  async createLink(req, res) {
    try {
      const { programId, targetUrl, customCode } = req.body;

      if (!programId || !targetUrl) {
        return res.status(400).json({
          success: false,
          error: 'Program ID and target URL are required'
        });
      }

      const link = await affiliateService.createAffiliateLink(
        req.user.id,
        programId,
        targetUrl,
        customCode
      );

      res.status(201).json({
        success: true,
        message: 'Affiliate link created successfully',
        data: link
      });
    } catch (error) {
      console.error('Create affiliate link error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create affiliate link'
      });
    }
  }

  // Get user's affiliate links
  async getLinks(req, res) {
    try {
      const links = await affiliateService.getUserAffiliateLinks(req.user.id);
      
      res.json({
        success: true,
        data: links
      });
    } catch (error) {
      console.error('Get affiliate links error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get affiliate links'
      });
    }
  }

  // Get affiliate analytics
  async getAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const analytics = await affiliateService.getAffiliateAnalytics(
        req.user.id,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get affiliate analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get affiliate analytics'
      });
    }
  }

  // Admin: Get pending affiliate applications
  async getPendingApplications(req, res) {
    try {
      const { status = 'pending' } = req.query;
      const applications = await affiliateService.getPendingApplications(status);
      
      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Get affiliate applications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get affiliate applications'
      });
    }
  }

  // Admin: Approve affiliate application
  async approveApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { notes } = req.body;

      const application = await affiliateService.approveApplication(
        applicationId,
        req.user.id,
        notes
      );

      res.json({
        success: true,
        message: 'Affiliate application approved successfully',
        data: application
      });
    } catch (error) {
      console.error('Approve affiliate application error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to approve application'
      });
    }
  }

  // Admin: Reject affiliate application
  async rejectApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Rejection reason is required'
        });
      }

      const application = await affiliateService.rejectApplication(
        applicationId,
        req.user.id,
        reason
      );

      res.json({
        success: true,
        message: 'Affiliate application rejected',
        data: application
      });
    } catch (error) {
      console.error('Reject affiliate application error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to reject application'
      });
    }
  }
}

// Sponsored Content Controller
class SponsoredContentController {
  // Create sponsored content campaign
  async createCampaign(req, res) {
    try {
      const campaignData = {
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        targeting: req.body.targeting || {},
        budget: req.body.budget,
        pricingModel: req.body.pricingModel || 'cpm',
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };

      const campaign = await sponsoredContentService.createCampaign(
        campaignData,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Sponsored content campaign created successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Create sponsored content error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create sponsored content campaign'
      });
    }
  }

  // Get active campaigns for display
  async getActiveCampaigns(req, res) {
    try {
      const { location, category, demographics } = req.query;
      
      const targeting = {};
      if (location) targeting.location = location;
      if (category) targeting.category = category;
      if (demographics) {
        try {
          targeting.demographics = JSON.parse(demographics);
        } catch (e) {
          console.warn('Invalid demographics JSON:', demographics);
        }
      }

      const campaigns = await sponsoredContentService.getActiveCampaigns(targeting);
      
      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      console.error('Get active sponsored content error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get active sponsored content'
      });
    }
  }

  // Record impression
  async recordImpression(req, res) {
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
      
      res.json({
        success: true,
        message: 'Impression recorded'
      });
    } catch (error) {
      console.error('Record impression error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record impression'
      });
    }
  }

  // Record click
  async recordClick(req, res) {
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
      
      res.json({
        success: true,
        message: 'Click recorded'
      });
    } catch (error) {
      console.error('Record click error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record click'
      });
    }
  }

  // Record conversion
  async recordConversion(req, res) {
    try {
      const { campaignId } = req.params;
      const { conversionType, value = 0 } = req.body;

      if (!conversionType) {
        return res.status(400).json({
          success: false,
          error: 'Conversion type is required'
        });
      }

      await sponsoredContentService.recordConversion(
        campaignId,
        req.user.id,
        conversionType,
        value
      );

      res.json({
        success: true,
        message: 'Conversion recorded'
      });
    } catch (error) {
      console.error('Record conversion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record conversion'
      });
    }
  }

  // Get campaign analytics
  async getCampaignAnalytics(req, res) {
    try {
      const { campaignId } = req.params;

      // Verify ownership or admin access
      const campaign = await SponsoredContent.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }

      if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const analytics = await sponsoredContentService.getCampaignAnalytics(campaignId);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get campaign analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get campaign analytics'
      });
    }
  }

  // Admin: Get campaigns for moderation
  async getCampaignsForModeration(req, res) {
    try {
      const { status = 'pending' } = req.query;
      const campaigns = await SponsoredContent.find({ status })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      console.error('Get campaigns for moderation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get campaigns'
      });
    }
  }

  // Admin: Approve campaign
  async approveCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const { notes } = req.body;

      const campaign = await sponsoredContentService.approveCampaign(
        campaignId,
        req.user.id,
        notes
      );

      res.json({
        success: true,
        message: 'Campaign approved successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Approve campaign error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to approve campaign'
      });
    }
  }

  // Admin: Reject campaign
  async rejectCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Rejection reason is required'
        });
      }

      const campaign = await sponsoredContentService.rejectCampaign(
        campaignId,
        req.user.id,
        reason
      );

      res.json({
        success: true,
        message: 'Campaign rejected',
        data: campaign
      });
    } catch (error) {
      console.error('Reject campaign error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to reject campaign'
      });
    }
  }

  // Admin: Activate campaign
  async activateCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const campaign = await sponsoredContentService.activateCampaign(campaignId);

      res.json({
        success: true,
        message: 'Campaign activated successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Activate campaign error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to activate campaign'
      });
    }
  }
}

// Export controller instances
module.exports = {
  subscriptionController: new SubscriptionController(),
  affiliateController: new AffiliateController(),
  sponsoredContentController: new SponsoredContentController()
};