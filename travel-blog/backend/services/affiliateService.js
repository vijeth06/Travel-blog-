const { AffiliateProgram, AffiliateUser, AffiliateLink } = require('../models/Monetization');
const User = require('../models/User');
const { sendEmail } = require('./emailService');
const crypto = require('crypto');

class AffiliateService {
  constructor() {
    this.defaultCommissionRate = 5; // 5%
    this.minPayoutAmount = 50;
    this.cookieExpirationDays = 30;
  }

  async createAffiliateProgram(programData) {
    try {
      const program = new AffiliateProgram(programData);
      await program.save();

      return program;
    } catch (error) {
      console.error('Create affiliate program error:', error);
      throw new Error('Failed to create affiliate program');
    }
  }

  async registerAffiliate(userId, applicationData) {
    try {
      // Check if user is already an affiliate
      let affiliateUser = await AffiliateUser.findOne({ user: userId });

      if (affiliateUser) {
        throw new Error('User is already registered as an affiliate');
      }

      // Generate unique referral code
      const referralCode = await this.generateUniqueReferralCode();

      affiliateUser = new AffiliateUser({
        user: userId,
        referralCode,
        profile: applicationData.profile || {},
        programs: []
      });

      await affiliateUser.save();

      // Send welcome email
      const user = await User.findById(userId);
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Our Affiliate Program! 🎉',
        template: 'affiliate-welcome',
        data: {
          userName: user.name,
          referralCode,
          dashboardUrl: `/affiliate/dashboard`
        }
      });

      return affiliateUser;
    } catch (error) {
      console.error('Register affiliate error:', error);
      throw new Error('Failed to register affiliate');
    }
  }

  async applyToProgram(userId, programId) {
    try {
      const affiliateUser = await AffiliateUser.findOne({ user: userId });
      const program = await AffiliateProgram.findById(programId);

      if (!affiliateUser) {
        throw new Error('User is not registered as an affiliate');
      }

      if (!program || program.status !== 'active') {
        throw new Error('Program not found or inactive');
      }

      // Check if already applied
      const existingApplication = affiliateUser.programs.find(
        p => p.program.toString() === programId
      );

      if (existingApplication) {
        throw new Error('Already applied to this program');
      }

      // Generate unique affiliate code for this program
      const uniqueCode = await this.generateProgramCode(affiliateUser.referralCode, programId);

      affiliateUser.programs.push({
        program: programId,
        status: program.requiresApproval ? 'pending' : 'approved',
        appliedAt: new Date(),
        approvedAt: program.requiresApproval ? null : new Date(),
        uniqueCode
      });

      await affiliateUser.save();

      // Send application confirmation
      const user = await User.findById(userId);
      await sendEmail({
        to: user.email,
        subject: `Application Submitted: ${program.name}`,
        template: 'affiliate-application',
        data: {
          userName: user.name,
          programName: program.name,
          status: program.requiresApproval ? 'pending' : 'approved',
          uniqueCode
        }
      });

      return affiliateUser;
    } catch (error) {
      console.error('Apply to program error:', error);
      throw new Error('Failed to apply to affiliate program');
    }
  }

  async createAffiliateLink(userId, linkData) {
    try {
      const affiliateUser = await AffiliateUser.findOne({ user: userId });

      if (!affiliateUser) {
        throw new Error('User is not registered as an affiliate');
      }

      // Check if user is approved for the program
      const programApplication = affiliateUser.programs.find(
        p => p.program.toString() === linkData.programId && p.status === 'approved'
      );

      if (!programApplication) {
        throw new Error('Not approved for this affiliate program');
      }

      // Generate tracking ID
      const trackingId = this.generateTrackingId();

      const affiliateLink = new AffiliateLink({
        affiliate: affiliateUser._id,
        program: linkData.programId,
        originalUrl: linkData.originalUrl,
        title: linkData.title,
        description: linkData.description,
        trackingId,
        customAlias: linkData.customAlias,
        utmParameters: linkData.utmParameters,
        associatedContent: linkData.associatedContent
      });

      await affiliateLink.save();

      // Generate short URL
      const shortUrl = this.generateShortUrl(trackingId, linkData.customAlias);
      affiliateLink.shortUrl = shortUrl;
      await affiliateLink.save();

      return affiliateLink;
    } catch (error) {
      console.error('Create affiliate link error:', error);
      throw new Error('Failed to create affiliate link');
    }
  }

  async trackClick(trackingId, clickData) {
    try {
      const affiliateLink = await AffiliateLink.findOne({ trackingId })
        .populate('affiliate')
        .populate('program');

      if (!affiliateLink || affiliateLink.status !== 'active') {
        throw new Error('Invalid or inactive affiliate link');
      }

      // Check if link has expired
      if (affiliateLink.expiresAt && new Date() > affiliateLink.expiresAt) {
        throw new Error('Affiliate link has expired');
      }

      // Update click analytics
      affiliateLink.analytics.clicks++;

      // Track unique clicks (simplified - in production, use IP + user agent hash)
      if (clickData.isUnique) {
        affiliateLink.analytics.uniqueClicks++;
      }

      // Track by country
      if (clickData.country) {
        let countryStat = affiliateLink.analytics.clicksByCountry.find(
          c => c.country === clickData.country
        );
        if (countryStat) {
          countryStat.clicks++;
        } else {
          affiliateLink.analytics.clicksByCountry.push({
            country: clickData.country,
            clicks: 1
          });
        }
      }

      // Track by device
      if (clickData.device) {
        let deviceStat = affiliateLink.analytics.clicksByDevice.find(
          d => d.device === clickData.device
        );
        if (deviceStat) {
          deviceStat.clicks++;
        } else {
          affiliateLink.analytics.clicksByDevice.push({
            device: clickData.device,
            clicks: 1
          });
        }
      }

      // Track by referrer
      if (clickData.referrer) {
        let referrerStat = affiliateLink.analytics.clicksByReferrer.find(
          r => r.referrer === clickData.referrer
        );
        if (referrerStat) {
          referrerStat.clicks++;
        } else {
          affiliateLink.analytics.clicksByReferrer.push({
            referrer: clickData.referrer,
            clicks: 1
          });
        }
      }

      await affiliateLink.save();

      // Update affiliate user stats
      const affiliateUser = affiliateLink.affiliate;
      affiliateUser.stats.totalClicks++;
      await affiliateUser.save();

      return {
        redirectUrl: affiliateLink.originalUrl,
        trackingId: affiliateLink.trackingId
      };
    } catch (error) {
      console.error('Track click error:', error);
      throw new Error('Failed to track affiliate click');
    }
  }

  async recordConversion(trackingId, conversionData) {
    try {
      const affiliateLink = await AffiliateLink.findOne({ trackingId })
        .populate('affiliate')
        .populate('program');

      if (!affiliateLink) {
        throw new Error('Affiliate link not found');
      }

      const program = affiliateLink.program;
      const affiliateUser = affiliateLink.affiliate;

      // Calculate commission
      let commissionAmount = 0;
      if (program.commission.type === 'percentage') {
        commissionAmount = (conversionData.orderValue * program.commission.rate) / 100;
      } else if (program.commission.type === 'fixed') {
        commissionAmount = program.commission.rate;
      } else if (program.commission.type === 'tiered') {
        // Find appropriate tier based on affiliate's total sales
        const tier = program.commission.tiers.find(t => 
          affiliateUser.stats.totalConversions >= t.minSales
        );
        commissionAmount = tier ? (conversionData.orderValue * tier.rate) / 100 : 0;
      }

      // Update link analytics
      affiliateLink.analytics.conversions++;
      affiliateLink.analytics.earnings += commissionAmount;
      await affiliateLink.save();

      // Update affiliate stats
      affiliateUser.stats.totalConversions++;
      affiliateUser.stats.totalEarnings += commissionAmount;
      affiliateUser.stats.pendingEarnings += commissionAmount;
      affiliateUser.stats.conversionRate = 
        (affiliateUser.stats.totalConversions / affiliateUser.stats.totalClicks) * 100;
      await affiliateUser.save();

      // Send conversion notification
      const user = await User.findById(affiliateUser.user);
      await sendEmail({
        to: user.email,
        subject: '💰 New Affiliate Commission Earned!',
        template: 'affiliate-conversion',
        data: {
          userName: user.name,
          commissionAmount: commissionAmount.toFixed(2),
          currency: program.commission.currency,
          orderValue: conversionData.orderValue.toFixed(2),
          programName: program.name
        }
      });

      return {
        commissionAmount,
        totalEarnings: affiliateUser.stats.totalEarnings
      };
    } catch (error) {
      console.error('Record conversion error:', error);
      throw new Error('Failed to record affiliate conversion');
    }
  }

  async getAffiliateStats(userId, timeframe = 'all') {
    try {
      const affiliateUser = await AffiliateUser.findOne({ user: userId })
        .populate('programs.program');

      if (!affiliateUser) {
        throw new Error('User is not an affiliate');
      }

      // Get link performance
      const links = await AffiliateLink.find({ affiliate: affiliateUser._id })
        .populate('program', 'name')
        .sort({ 'analytics.clicks': -1 });

      // Calculate timeframe-based stats (simplified)
      let timeframeStats = {
        clicks: 0,
        conversions: 0,
        earnings: 0
      };

      if (timeframe !== 'all') {
        // In production, you'd filter by date ranges
        timeframeStats = {
          clicks: Math.floor(affiliateUser.stats.totalClicks * 0.3), // Example
          conversions: Math.floor(affiliateUser.stats.totalConversions * 0.3),
          earnings: affiliateUser.stats.totalEarnings * 0.3
        };
      } else {
        timeframeStats = {
          clicks: affiliateUser.stats.totalClicks,
          conversions: affiliateUser.stats.totalConversions,
          earnings: affiliateUser.stats.totalEarnings
        };
      }

      return {
        overall: affiliateUser.stats,
        timeframe: timeframeStats,
        programs: affiliateUser.programs,
        topLinks: links.slice(0, 10),
        conversionRate: affiliateUser.stats.conversionRate,
        pendingPayout: affiliateUser.stats.pendingEarnings
      };
    } catch (error) {
      console.error('Get affiliate stats error:', error);
      throw new Error('Failed to get affiliate statistics');
    }
  }

  async approveAffiliateApplication(programId, affiliateUserId, adminId) {
    try {
      const affiliateUser = await AffiliateUser.findById(affiliateUserId);
      
      if (!affiliateUser) {
        throw new Error('Affiliate user not found');
      }

      const programApplication = affiliateUser.programs.find(
        p => p.program.toString() === programId
      );

      if (!programApplication) {
        throw new Error('Application not found');
      }

      if (programApplication.status !== 'pending') {
        throw new Error('Application is not pending approval');
      }

      programApplication.status = 'approved';
      programApplication.approvedAt = new Date();
      await affiliateUser.save();

      // Send approval notification
      const user = await User.findById(affiliateUser.user);
      const program = await AffiliateProgram.findById(programId);

      await sendEmail({
        to: user.email,
        subject: `🎉 Affiliate Application Approved: ${program.name}`,
        template: 'affiliate-approved',
        data: {
          userName: user.name,
          programName: program.name,
          uniqueCode: programApplication.uniqueCode,
          dashboardUrl: `/affiliate/dashboard`
        }
      });

      return affiliateUser;
    } catch (error) {
      console.error('Approve affiliate application error:', error);
      throw new Error('Failed to approve affiliate application');
    }
  }

  async generateUniqueReferralCode() {
    let referralCode;
    let isUnique = false;

    while (!isUnique) {
      referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await AffiliateUser.findOne({ referralCode });
      if (!existing) {
        isUnique = true;
      }
    }

    return referralCode;
  }

  async generateProgramCode(referralCode, programId) {
    const programShort = programId.toString().slice(-4).toUpperCase();
    return `${referralCode}-${programShort}`;
  }

  generateTrackingId() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateShortUrl(trackingId, customAlias = null) {
    const baseUrl = process.env.BASE_URL || 'https://yourdomain.com';
    const alias = customAlias || trackingId.slice(0, 8);
    return `${baseUrl}/go/${alias}`;
  }

  async getTopAffiliates(limit = 10, timeframe = 'month') {
    try {
      const affiliates = await AffiliateUser.find()
        .populate('user', 'name avatar')
        .sort({ 'stats.totalEarnings': -1 })
        .limit(limit);

      return affiliates.map(affiliate => ({
        user: affiliate.user,
        stats: affiliate.stats,
        referralCode: affiliate.referralCode,
        joinedAt: affiliate.createdAt
      }));
    } catch (error) {
      console.error('Get top affiliates error:', error);
      throw new Error('Failed to get top affiliates');
    }
  }

  async getAffiliatePrograms(filters = {}) {
    try {
      const { status = 'active', category } = filters;
      
      let query = { status };
      if (category) {
        query.categories = category;
      }

      const programs = await AffiliateProgram.find(query)
        .populate('categories', 'name')
        .sort({ createdAt: -1 });

      return programs;
    } catch (error) {
      console.error('Get affiliate programs error:', error);
      throw new Error('Failed to get affiliate programs');
    }
  }
}

module.exports = new AffiliateService();