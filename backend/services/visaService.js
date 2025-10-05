const { VisaRequirement, UserVisaApplication } = require('../models/VisaRequirement');
const User = require('../models/User');
const axios = require('axios');

class VisaService {
  constructor() {
    // Country codes mapping for common countries
    this.countryCodes = {
      'united states': 'US',
      'usa': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'canada': 'CA',
      'australia': 'AU',
      'germany': 'DE',
      'france': 'FR',
      'japan': 'JP',
      'india': 'IN',
      'china': 'CN',
      'brazil': 'BR',
      'russia': 'RU',
      'south africa': 'ZA'
    };
  }

  async checkVisaRequirement(fromCountry, toCountry) {
    try {
      // Normalize country names to ISO codes
      const fromCode = this.getCountryCode(fromCountry);
      const toCode = this.getCountryCode(toCountry);

      if (!fromCode || !toCode) {
        throw new Error('Invalid country names provided');
      }

      // Check database first
      let requirement = await VisaRequirement.findOne({
        fromCountry: fromCode,
        toCountry: toCode
      });

      // If not in database, try to fetch from external API or use default logic
      if (!requirement) {
        requirement = await this.fetchVisaRequirement(fromCode, toCode);
      }

      // Check if data is outdated (older than 30 days)
      if (requirement && this.isDataOutdated(requirement.updates.lastUpdated)) {
        requirement = await this.updateVisaRequirement(fromCode, toCode);
      }

      return requirement;

    } catch (error) {
      console.error('Check visa requirement error:', error);
      throw new Error('Failed to check visa requirement');
    }
  }

  async fetchVisaRequirement(fromCode, toCode) {
    try {
      // Try to fetch from external visa API (example: VisaList API)
      // In a real implementation, you would use a service like:
      // - VisaList API
      // - IATA Travel Requirements API
      // - Government databases

      // For now, we'll use a rule-based approach with common visa policies
      const requirement = this.generateVisaRequirement(fromCode, toCode);
      
      // Save to database
      const visaReq = new VisaRequirement(requirement);
      await visaReq.save();
      
      return visaReq;

    } catch (error) {
      console.error('Fetch visa requirement error:', error);
      // Return a default requirement if external fetch fails
      return this.generateDefaultRequirement(fromCode, toCode);
    }
  }

  generateVisaRequirement(fromCode, toCode) {
    // This is a simplified rule-based system
    // In a real application, this would be much more comprehensive
    
    const visaFreeCountries = {
      'US': ['CA', 'GB', 'FR', 'DE', 'JP', 'AU'], // US passport visa-free destinations
      'GB': ['US', 'CA', 'FR', 'DE', 'JP', 'AU'], // UK passport visa-free destinations
      'DE': ['US', 'CA', 'GB', 'FR', 'JP', 'AU'], // German passport visa-free destinations
      'CA': ['US', 'GB', 'FR', 'DE', 'JP', 'AU']  // Canadian passport visa-free destinations
    };

    const visaOnArrivalCountries = {
      'US': ['IN'], // US passport can get visa on arrival in India (example)
      'GB': ['IN'],
      'DE': ['IN'],
      'CA': ['IN']
    };

    let requirement = 'visa_required'; // Default
    let maxStayDays = null;
    let fees = { amount: 0, currency: 'USD' };
    let processingTime = { min: 7, max: 21 };

    // Check visa-free access
    if (visaFreeCountries[fromCode]?.includes(toCode)) {
      requirement = 'visa_free';
      maxStayDays = toCode === 'US' ? 90 : 180; // Example durations
    } 
    // Check visa on arrival
    else if (visaOnArrivalCountries[fromCode]?.includes(toCode)) {
      requirement = 'visa_on_arrival';
      maxStayDays = 30;
      fees = { amount: 25, currency: 'USD' };
      processingTime = { min: 0, max: 1 };
    }
    // Special cases for eVisa
    else if (toCode === 'IN') {
      requirement = 'evisa';
      maxStayDays = 60;
      fees = { amount: 10, currency: 'USD' };
      processingTime = { min: 3, max: 7 };
    }

    return {
      fromCountry: fromCode,
      toCountry: toCode,
      requirement,
      maxStayDays,
      conditions: this.getCommonConditions(requirement),
      fees,
      processingTime,
      documentation: this.getRequiredDocumentation(requirement),
      applicationProcess: this.getApplicationProcess(requirement),
      updates: {
        lastUpdated: new Date(),
        source: 'internal_system',
        reliability: 'medium'
      }
    };
  }

  getCommonConditions(requirement) {
    const conditions = ['passport_validity_6_months'];
    
    if (requirement === 'visa_free') {
      conditions.push('return_ticket', 'proof_of_funds');
    } else if (requirement === 'visa_on_arrival') {
      conditions.push('return_ticket', 'proof_of_funds', 'passport_photo');
    } else {
      conditions.push('return_ticket', 'proof_of_funds', 'bank_statement', 'travel_insurance');
    }
    
    return conditions;
  }

  getRequiredDocumentation(requirement) {
    const docs = {
      required: ['passport'],
      optional: [],
      specifications: {
        passportValidity: 6,
        photoRequirements: '2 recent passport-size photos'
      }
    };

    if (requirement !== 'visa_free') {
      docs.required.push('photo', 'form');
      
      if (requirement === 'visa_required' || requirement === 'evisa') {
        docs.required.push('bank_statement', 'travel_insurance', 'itinerary');
      }
    }

    return docs;
  }

  getApplicationProcess(requirement) {
    switch (requirement) {
      case 'visa_free':
        return {
          onlineApplication: false,
          embassyRequired: false,
          biometricsRequired: false,
          interviewRequired: false
        };
      case 'visa_on_arrival':
        return {
          onlineApplication: false,
          embassyRequired: false,
          biometricsRequired: false,
          interviewRequired: false
        };
      case 'evisa':
        return {
          onlineApplication: true,
          embassyRequired: false,
          biometricsRequired: false,
          interviewRequired: false
        };
      default:
        return {
          onlineApplication: false,
          embassyRequired: true,
          biometricsRequired: true,
          interviewRequired: true
        };
    }
  }

  generateDefaultRequirement(fromCode, toCode) {
    return {
      fromCountry: fromCode,
      toCountry: toCode,
      requirement: 'visa_required',
      maxStayDays: null,
      conditions: ['passport_validity_6_months', 'visa_required'],
      fees: { amount: 0, currency: 'USD' },
      processingTime: { min: 14, max: 30 },
      documentation: {
        required: ['passport', 'form', 'photo'],
        specifications: { passportValidity: 6 }
      },
      updates: {
        lastUpdated: new Date(),
        source: 'default_system',
        reliability: 'low'
      }
    };
  }

  getCountryCode(countryName) {
    const normalized = countryName.toLowerCase().trim();
    return this.countryCodes[normalized] || countryName.toUpperCase();
  }

  isDataOutdated(lastUpdated) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return new Date(lastUpdated) < thirtyDaysAgo;
  }

  async updateVisaRequirement(fromCode, toCode) {
    try {
      // Fetch updated data
      const updatedData = await this.fetchVisaRequirement(fromCode, toCode);
      
      // Update existing record
      await VisaRequirement.findOneAndUpdate(
        { fromCountry: fromCode, toCountry: toCode },
        updatedData,
        { new: true }
      );

      return updatedData;

    } catch (error) {
      console.error('Update visa requirement error:', error);
      // Return existing data if update fails
      return await VisaRequirement.findOne({
        fromCountry: fromCode,
        toCountry: toCode
      });
    }
  }

  async createVisaApplication(userId, visaRequirementId, travelDetails) {
    try {
      const user = await User.findById(userId);
      const visaRequirement = await VisaRequirement.findById(visaRequirementId);

      if (!visaRequirement) {
        throw new Error('Visa requirement not found');
      }

      // Calculate duration
      const duration = Math.ceil(
        (new Date(travelDetails.plannedDeparture) - new Date(travelDetails.plannedArrival)) / 
        (1000 * 60 * 60 * 24)
      );

      const application = new UserVisaApplication({
        user: userId,
        visaRequirement: visaRequirementId,
        travelDetails: {
          ...travelDetails,
          duration
        },
        documents: {
          required: visaRequirement.documentation.required,
          missing: visaRequirement.documentation.required
        },
        payment: {
          totalFees: visaRequirement.fees.amount
        }
      });

      await application.save();
      
      return await UserVisaApplication.findById(application._id)
        .populate('visaRequirement')
        .populate('user', 'name email');

    } catch (error) {
      console.error('Create visa application error:', error);
      throw new Error('Failed to create visa application');
    }
  }

  async getUserVisaApplications(userId) {
    try {
      const applications = await UserVisaApplication.find({ user: userId })
        .populate('visaRequirement')
        .sort({ createdAt: -1 });

      return applications;

    } catch (error) {
      console.error('Get user visa applications error:', error);
      throw new Error('Failed to get visa applications');
    }
  }

  async updateApplicationStatus(applicationId, status, additionalData = {}) {
    try {
      const application = await UserVisaApplication.findById(applicationId);
      
      if (!application) {
        throw new Error('Visa application not found');
      }

      application.applicationStatus.status = status;
      
      if (additionalData.applicationNumber) {
        application.applicationStatus.applicationNumber = additionalData.applicationNumber;
      }
      
      if (additionalData.submittedDate) {
        application.applicationStatus.submittedDate = new Date(additionalData.submittedDate);
      }
      
      if (additionalData.expectedDecision) {
        application.applicationStatus.expectedDecision = new Date(additionalData.expectedDecision);
      }

      if (status === 'approved' && additionalData.result) {
        application.result = additionalData.result;
      }

      if (status === 'denied' && additionalData.denialReason) {
        application.result.denialReason = additionalData.denialReason;
      }

      await application.save();
      return application;

    } catch (error) {
      console.error('Update application status error:', error);
      throw new Error('Failed to update application status');
    }
  }

  async getVisaStatistics() {
    try {
      // Most common visa requirements
      const requirementStats = await VisaRequirement.aggregate([
        {
          $group: {
            _id: '$requirement',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Most popular destinations (by applications)
      const destinationStats = await UserVisaApplication.aggregate([
        {
          $lookup: {
            from: 'visarequirements',
            localField: 'visaRequirement',
            foreignField: '_id',
            as: 'requirement'
          }
        },
        { $unwind: '$requirement' },
        {
          $group: {
            _id: '$requirement.toCountry',
            applications: { $sum: 1 }
          }
        },
        { $sort: { applications: -1 } },
        { $limit: 10 }
      ]);

      // Application status distribution
      const statusStats = await UserVisaApplication.aggregate([
        {
          $group: {
            _id: '$applicationStatus.status',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        requirementDistribution: requirementStats,
        popularDestinations: destinationStats,
        applicationStatusDistribution: statusStats
      };

    } catch (error) {
      console.error('Get visa statistics error:', error);
      throw new Error('Failed to get visa statistics');
    }
  }

  async getVisaCalendar(userId) {
    try {
      const applications = await UserVisaApplication.find({ 
        user: userId,
        'applicationStatus.status': { $in: ['in_progress', 'submitted', 'under_review'] }
      }).populate('visaRequirement');

      const calendar = applications.map(app => ({
        applicationId: app._id,
        destination: app.visaRequirement.toCountry,
        travelDate: app.travelDetails.plannedArrival,
        deadlines: {
          application: app.applicationStatus.expectedDecision,
          travel: app.travelDetails.plannedArrival
        },
        status: app.applicationStatus.status,
        urgency: this.calculateUrgency(app)
      }));

      return calendar.sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));

    } catch (error) {
      console.error('Get visa calendar error:', error);
      throw new Error('Failed to get visa calendar');
    }
  }

  calculateUrgency(application) {
    const now = new Date();
    const travelDate = new Date(application.travelDetails.plannedArrival);
    const daysUntilTravel = Math.ceil((travelDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilTravel < 30) return 'high';
    if (daysUntilTravel < 60) return 'medium';
    return 'low';
  }
}

module.exports = new VisaService();