const { SponsoredContent } = require('../models/Monetization');
const User = require('../models/User');
const Category = require('../models/Category');
const { sendEmail } = require('./emailService');

class SponsoredContentService {
  constructor() {
    this.defaultCPCRate = 0.50; // Default cost per click
    this.defaultCPMRate = 2.00; // Default cost per thousand impressions
  }

  async createCampaign(campaignData, createdBy) {
    try {
      // Validate targeting criteria
      if (campaignData.targeting) {
        await this.validateTargeting(campaignData.targeting);
      }

      // Calculate estimated reach
      const estimatedReach = await this.calculateEstimatedReach(campaignData.targeting);

      const campaign = new SponsoredContent({
        ...campaignData,
        createdBy,
        estimatedReach,
        createdAt: new Date()
      });

      await campaign.save();

      // Notify admin team for approval
      await this.notifyAdminTeam(campaign);

      return campaign;
    } catch (error) {
      console.error('Create campaign error:', error);
      throw new Error('Failed to create sponsored content campaign');
    }
  }

  async validateTargeting(targeting) {
    try {
      // Validate location targeting
      if (targeting.locations && targeting.locations.length > 0) {
        // Check if locations exist in our database
        // Implementation depends on your location data structure
      }

      // Validate category targeting
      if (targeting.categories && targeting.categories.length > 0) {
        const validCategories = await Category.find({
          _id: { $in: targeting.categories }
        });
        
        if (validCategories.length !== targeting.categories.length) {
          throw new Error('Invalid category targeting specified');
        }
      }

      // Validate age range
      if (targeting.demographics && targeting.demographics.ageRange) {
        const { min, max } = targeting.demographics.ageRange;
        if (min < 13 || max > 120 || min >= max) {
          throw new Error('Invalid age range specified');
        }
      }

      return true;
    } catch (error) {
      console.error('Validate targeting error:', error);
      throw error;
    }
  }

  async calculateEstimatedReach(targeting) {
    try {
      let baseReach = 10000; // Default base reach

      // Adjust based on targeting criteria
      if (targeting) {
        // Reduce reach for specific targeting
        if (targeting.locations && targeting.locations.length > 0) {
          baseReach *= 0.7; // 30% reduction for location targeting
        }

        if (targeting.categories && targeting.categories.length > 0) {
          baseReach *= 0.8; // 20% reduction for category targeting
        }

        if (targeting.demographics) {
          if (targeting.demographics.ageRange) {
            const ageSpan = targeting.demographics.ageRange.max - targeting.demographics.ageRange.min;
            baseReach *= (ageSpan / 60); // Adjust based on age span
          }

          if (targeting.demographics.gender && targeting.demographics.gender !== 'all') {
            baseReach *= 0.5; // 50% reduction for gender targeting
          }
        }

        if (targeting.interests && targeting.interests.length > 0) {
          baseReach *= 0.6; // 40% reduction for interest targeting
        }
      }

      return Math.round(baseReach);
    } catch (error) {
      console.error('Calculate estimated reach error:', error);
      return 5000; // Fallback reach
    }
  }

  async approveCampaign(campaignId, adminId, notes = null) {
    try {
      const campaign = await SponsoredContent.findById(campaignId)
        .populate('createdBy', 'name email');

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'pending') {
        throw new Error('Campaign is not in pending status');
      }

      campaign.status = 'approved';
      campaign.approvedBy = adminId;
      campaign.approvedAt = new Date();
      
      if (notes) {
        campaign.moderation.adminNotes = notes;
      }

      await campaign.save();

      // Notify campaign creator
      await sendEmail({
        to: campaign.createdBy.email,
        subject: 'Sponsored Content Campaign Approved! 🎉',
        template: 'campaign-approved',
        data: {
          userName: campaign.createdBy.name,
          campaignTitle: campaign.title,
          adminNotes: notes
        }
      });

      return campaign;
    } catch (error) {
      console.error('Approve campaign error:', error);
      throw new Error('Failed to approve campaign');
    }
  }

  async rejectCampaign(campaignId, adminId, reason) {
    try {
      const campaign = await SponsoredContent.findById(campaignId)
        .populate('createdBy', 'name email');

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.status = 'rejected';
      campaign.moderation = {
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: reason
      };

      await campaign.save();

      // Notify campaign creator
      await sendEmail({
        to: campaign.createdBy.email,
        subject: 'Sponsored Content Campaign Update',
        template: 'campaign-rejected',
        data: {
          userName: campaign.createdBy.name,
          campaignTitle: campaign.title,
          rejectionReason: reason
        }
      });

      return campaign;
    } catch (error) {
      console.error('Reject campaign error:', error);
      throw new Error('Failed to reject campaign');
    }
  }

  async activateCampaign(campaignId) {
    try {
      const campaign = await SponsoredContent.findById(campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'approved') {
        throw new Error('Campaign must be approved before activation');
      }

      // Check if campaign start date is valid
      if (campaign.startDate > new Date()) {
        campaign.status = 'scheduled';
      } else {
        campaign.status = 'active';
      }

      await campaign.save();

      return campaign;
    } catch (error) {
      console.error('Activate campaign error:', error);
      throw new Error('Failed to activate campaign');
    }
  }

  async recordImpression(campaignId, userId = null, metadata = {}) {
    try {
      const campaign = await SponsoredContent.findById(campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'active') {
        return; // Don't record impressions for inactive campaigns
      }

      // Update impression metrics
      campaign.performance.impressions += 1;
      campaign.performance.lastImpressionAt = new Date();

      // Record detailed impression
      campaign.performance.impressionLog.push({
        userId: userId || null,
        timestamp: new Date(),
        metadata: {
          userAgent: metadata.userAgent,
          location: metadata.location,
          referrer: metadata.referrer,
          deviceType: metadata.deviceType
        }
      });

      // Calculate cost for CPM campaigns
      if (campaign.pricingModel === 'cpm') {
        const costPer1000 = campaign.budget.maxCPM || this.defaultCPMRate;
        const impressionCost = costPer1000 / 1000;
        campaign.performance.totalCost += impressionCost;
      }

      await campaign.save();

      // Check if budget limit reached
      await this.checkBudgetLimits(campaign);

      return true;
    } catch (error) {
      console.error('Record impression error:', error);
      // Don't throw error to avoid disrupting user experience
      return false;
    }
  }

  async recordClick(campaignId, userId = null, metadata = {}) {
    try {
      const campaign = await SponsoredContent.findById(campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'active') {
        return; // Don't record clicks for inactive campaigns
      }

      // Update click metrics
      campaign.performance.clicks += 1;
      campaign.performance.lastClickAt = new Date();

      // Record detailed click
      campaign.performance.clickLog.push({
        userId: userId || null,
        timestamp: new Date(),
        metadata: {
          userAgent: metadata.userAgent,
          location: metadata.location,
          referrer: metadata.referrer,
          deviceType: metadata.deviceType
        }
      });

      // Calculate cost for CPC campaigns
      if (campaign.pricingModel === 'cpc') {
        const costPerClick = campaign.budget.maxCPC || this.defaultCPCRate;
        campaign.performance.totalCost += costPerClick;
      }

      // Update CTR
      if (campaign.performance.impressions > 0) {
        campaign.performance.ctr = (campaign.performance.clicks / campaign.performance.impressions) * 100;
      }

      await campaign.save();

      // Check if budget limit reached
      await this.checkBudgetLimits(campaign);

      return true;
    } catch (error) {
      console.error('Record click error:', error);
      return false;
    }
  }

  async recordConversion(campaignId, userId, conversionType, value = 0) {
    try {
      const campaign = await SponsoredContent.findById(campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update conversion metrics
      campaign.performance.conversions += 1;
      campaign.performance.conversionValue += value;

      // Record detailed conversion
      campaign.performance.conversionLog.push({
        userId,
        timestamp: new Date(),
        type: conversionType,
        value
      });

      // Update conversion rate
      if (campaign.performance.clicks > 0) {
        campaign.performance.conversionRate = (campaign.performance.conversions / campaign.performance.clicks) * 100;
      }

      await campaign.save();

      return true;
    } catch (error) {
      console.error('Record conversion error:', error);
      return false;
    }
  }

  async checkBudgetLimits(campaign) {
    try {
      const totalBudget = campaign.budget.totalBudget;
      const dailyBudget = campaign.budget.dailyBudget;
      const currentCost = campaign.performance.totalCost;

      // Check total budget
      if (totalBudget && currentCost >= totalBudget) {
        campaign.status = 'completed';
        campaign.endDate = new Date();
        
        await sendEmail({
          to: await this.getCampaignOwnerEmail(campaign.createdBy),
          subject: 'Campaign Budget Exhausted',
          template: 'budget-exhausted',
          data: {
            campaignTitle: campaign.title,
            totalSpent: currentCost.toFixed(2)
          }
        });
      }

      // Check daily budget (implementation would need more complex daily tracking)
      // This is a simplified check
      if (dailyBudget) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get today's impressions and clicks to calculate daily spend
        const todayImpressions = campaign.performance.impressionLog.filter(
          log => log.timestamp >= today
        ).length;
        
        const todayClicks = campaign.performance.clickLog.filter(
          log => log.timestamp >= today
        ).length;

        let dailySpend = 0;
        if (campaign.pricingModel === 'cpm') {
          dailySpend = (todayImpressions / 1000) * (campaign.budget.maxCPM || this.defaultCPMRate);
        } else if (campaign.pricingModel === 'cpc') {
          dailySpend = todayClicks * (campaign.budget.maxCPC || this.defaultCPCRate);
        }

        if (dailySpend >= dailyBudget) {
          campaign.status = 'paused';
          // Will be automatically reactivated tomorrow
        }
      }

      await campaign.save();
    } catch (error) {
      console.error('Check budget limits error:', error);
    }
  }

  async getCampaignOwnerEmail(userId) {
    try {
      const user = await User.findById(userId, 'email');
      return user?.email || 'support@travelapp.com';
    } catch (error) {
      return 'support@travelapp.com';
    }
  }

  async getActiveCampaigns(targeting = {}) {
    try {
      const query = {
        status: 'active',
        startDate: { $lte: new Date() },
        $or: [
          { endDate: { $gte: new Date() } },
          { endDate: null }
        ]
      };

      // Apply targeting filters
      if (targeting.location) {
        query['targeting.locations'] = { $in: [targeting.location] };
      }

      if (targeting.category) {
        query['targeting.categories'] = { $in: [targeting.category] };
      }

      if (targeting.demographics) {
        const { age, gender } = targeting.demographics;
        
        if (age) {
          query['targeting.demographics.ageRange.min'] = { $lte: age };
          query['targeting.demographics.ageRange.max'] = { $gte: age };
        }

        if (gender && gender !== 'all') {
          query['$or'] = [
            { 'targeting.demographics.gender': gender },
            { 'targeting.demographics.gender': 'all' }
          ];
        }
      }

      const campaigns = await SponsoredContent.find(query)
        .populate('createdBy', 'name')
        .sort({ 'budget.totalBudget': -1 }); // Prioritize higher budget campaigns

      return campaigns;
    } catch (error) {
      console.error('Get active campaigns error:', error);
      throw new Error('Failed to get active campaigns');
    }
  }

  async getCampaignAnalytics(campaignId) {
    try {
      const campaign = await SponsoredContent.findById(campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const analytics = {
        overview: {
          impressions: campaign.performance.impressions,
          clicks: campaign.performance.clicks,
          conversions: campaign.performance.conversions,
          ctr: campaign.performance.ctr.toFixed(2) + '%',
          conversionRate: campaign.performance.conversionRate.toFixed(2) + '%',
          totalCost: campaign.performance.totalCost.toFixed(2),
          averageCPC: campaign.performance.clicks > 0 ? 
            (campaign.performance.totalCost / campaign.performance.clicks).toFixed(2) : '0.00',
          averageCPM: campaign.performance.impressions > 0 ? 
            ((campaign.performance.totalCost / campaign.performance.impressions) * 1000).toFixed(2) : '0.00'
        },
        timeline: await this.getCampaignTimeline(campaign),
        demographics: await this.getCampaignDemographics(campaign),
        locations: await this.getCampaignLocationData(campaign)
      };

      return analytics;
    } catch (error) {
      console.error('Get campaign analytics error:', error);
      throw new Error('Failed to get campaign analytics');
    }
  }

  async getCampaignTimeline(campaign) {
    try {
      const timeline = {};
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      // Group impressions by day
      campaign.performance.impressionLog.forEach(log => {
        if (log.timestamp >= last30Days) {
          const date = log.timestamp.toISOString().split('T')[0];
          if (!timeline[date]) {
            timeline[date] = { impressions: 0, clicks: 0 };
          }
          timeline[date].impressions += 1;
        }
      });

      // Group clicks by day
      campaign.performance.clickLog.forEach(log => {
        if (log.timestamp >= last30Days) {
          const date = log.timestamp.toISOString().split('T')[0];
          if (!timeline[date]) {
            timeline[date] = { impressions: 0, clicks: 0 };
          }
          timeline[date].clicks += 1;
        }
      });

      return timeline;
    } catch (error) {
      console.error('Get campaign timeline error:', error);
      return {};
    }
  }

  async getCampaignDemographics(campaign) {
    // This would require additional user demographic tracking
    // Return placeholder data for now
    return {
      ageGroups: {
        '18-24': 25,
        '25-34': 35,
        '35-44': 20,
        '45-54': 15,
        '55+': 5
      },
      gender: {
        male: 45,
        female: 50,
        other: 5
      }
    };
  }

  async getCampaignLocationData(campaign) {
    // Analyze location data from logs
    const locationCounts = {};
    
    campaign.performance.impressionLog.forEach(log => {
      if (log.metadata && log.metadata.location) {
        const location = log.metadata.location;
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });

    return locationCounts;
  }

  async notifyAdminTeam(campaign) {
    try {
      // Get admin users
      const admins = await User.find({ role: 'admin' }, 'email');
      
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: 'New Sponsored Content Campaign Pending Approval',
          template: 'campaign-pending-approval',
          data: {
            campaignTitle: campaign.title,
            advertiser: campaign.createdBy,
            budget: campaign.budget.totalBudget,
            approvalUrl: `/admin/campaigns/${campaign._id}`
          }
        });
      }
    } catch (error) {
      console.error('Notify admin team error:', error);
    }
  }
}

module.exports = new SponsoredContentService();