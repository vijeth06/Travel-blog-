const RealCertificationService = require('../services/realCertificationService');
const Certificate = require('../models/Certificate');
const logger = require('../utils/logger');

class RealCertificationController {
  /**
   * Get available skill areas for certification
   */
  static async getSkillAreas(req, res) {
    try {
      const skillAreas = [
        {
          id: 'travel_blogging',
          name: 'Travel Blogging',
          description: 'Master the art of travel storytelling and content creation',
          requirements: 'Minimum 5 published blogs, community engagement',
          levels: ['bronze', 'silver', 'gold', 'platinum'],
          estimatedTime: '2-4 weeks'
        },
        {
          id: 'photography',
          name: 'Travel Photography',
          description: 'Develop expertise in capturing stunning travel moments',
          requirements: 'Photo uploads, visual storytelling skills',
          levels: ['bronze', 'silver', 'gold', 'platinum'],
          estimatedTime: '3-6 weeks'
        },
        {
          id: 'destination_expert',
          name: 'Destination Expert',
          description: 'Become a recognized authority on specific destinations',
          requirements: 'Multiple visits, detailed guides, local insights',
          levels: ['bronze', 'silver', 'gold', 'platinum'],
          estimatedTime: '4-8 weeks'
        },
        {
          id: 'cultural_guide',
          name: 'Cultural Guide',
          description: 'Expertise in cultural experiences and local traditions',
          requirements: 'Cultural content, authentic experiences',
          levels: ['bronze', 'silver', 'gold', 'platinum'],
          estimatedTime: '4-6 weeks'
        },
        {
          id: 'adventure_specialist',
          name: 'Adventure Specialist',
          description: 'Master of outdoor activities and adventure travel',
          requirements: 'Adventure experiences, safety knowledge',
          levels: ['bronze', 'silver', 'gold', 'platinum'],
          estimatedTime: '3-5 weeks'
        },
        {
          id: 'budget_travel',
          name: 'Budget Travel Expert',
          description: 'Specialist in affordable travel and money-saving strategies',
          requirements: 'Budget travel content, cost-saving tips',
          levels: ['bronze', 'silver', 'gold', 'platinum'],
          estimatedTime: '2-4 weeks'
        },
        {
          id: 'sustainable_travel',
          name: 'Sustainable Travel Advocate',
          description: 'Expertise in eco-friendly and responsible travel',
          requirements: 'Sustainability content, environmental awareness',
          levels: ['bronze', 'silver', 'gold', 'platinum'],
          estimatedTime: '3-5 weeks'
        },
        {
          id: 'solo_travel',
          name: 'Solo Travel Specialist',
          description: 'Master of independent travel and solo adventures',
          requirements: 'Solo travel experiences, safety guides',
          levels: ['bronze', 'silver', 'gold', 'platinum'],
          estimatedTime: '3-4 weeks'
        }
      ];
      
      res.json({
        success: true,
        message: 'Available certification skill areas',
        data: {
          skillAreas,
          totalAreas: skillAreas.length,
          certificationProcess: {
            steps: [
              'Choose skill area',
              'Complete assessment',
              'Meet requirements',
              'Submit portfolio (Gold/Platinum)',
              'Receive certificate'
            ],
            validity: '1 year',
            renewable: true
          }
        }
      });
      
    } catch (error) {
      logger.error('❌ Get Skill Areas Error:', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to get skill areas',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Assess user's skill in a specific area
   */
  static async assessSkill(req, res) {
    try {
      const { skillArea } = req.params;
      const userId = req.user.id;
      
      logger.info(`🎓 Starting skill assessment for ${skillArea} - User: ${userId}`);
      
      const assessment = await RealCertificationService.assessUserSkill(userId, skillArea);
      
      // Track assessment activity for gamification
      const RealGamificationService = require('../services/realGamificationService');
      await RealGamificationService.trackActivity(userId, 'skill_assessments_taken');
      await RealGamificationService.awardPoints(userId, 25, 'skill assessment completion');
      
      logger.info(`✅ Skill assessment completed - Score: ${assessment.overallScore}%`);
      
      res.json({
        success: true,
        message: 'Skill assessment completed successfully',
        data: {
          assessment,
          nextSteps: assessment.eligible ? 
            ['You can now apply for certification!'] :
            ['Improve your score to 70% or higher', ...assessment.recommendations],
          pointsAwarded: 25
        }
      });
      
    } catch (error) {
      logger.error('❌ Skill Assessment Error:', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        message: 'Failed to assess skill',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Apply for certification
   */
  static async applyCertification(req, res) {
    try {
      const { skillArea } = req.params;
      const userId = req.user.id;
      const { portfolioUrl, additionalInfo } = req.body;
      
      logger.info(`🏆 Certification application for ${skillArea} - User: ${userId}`);
      
      const result = await RealCertificationService.issueCertification(userId, skillArea);
      
      logger.info(`✅ Certificate issued: ${result.certificate.certificateId}`);
      
      res.json({
        success: true,
        message: result.message,
        data: {
          certificate: result.certificate,
          assessment: result.assessment,
          pointsAwarded: result.pointsAwarded,
          digitalBadge: result.certificate.digitalBadge,
          verificationUrl: `/verify-certificate/${result.certificate.certificateId}`,
          nextSteps: [
            'Download your digital certificate',
            'Share your achievement on social media',
            'Add to your professional profile',
            'Explore advanced certifications'
          ]
        }
      });
      
    } catch (error) {
      logger.error('❌ Certification Application Error:', { error: error.message, userId: req.user.id });
      
      if (error.message.includes('does not meet certification requirements')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          suggestion: 'Complete the skill assessment first to check your eligibility'
        });
      }
      
      if (error.message.includes('already has an active certification')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          suggestion: 'You can renew your existing certificate or try a different skill area'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to process certification application',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Get user's certificates
   */
  static async getUserCertificates(req, res) {
    try {
      const userId = req.user.id;
      const { status = 'active' } = req.query;
      
      logger.info(`📋 Getting certificates for user ${userId}`);
      
      const certificates = await Certificate.getUserCertificates(userId, status);
      
      // Calculate certificate statistics
      const stats = {
        total: certificates.length,
        active: certificates.filter(cert => cert.status === 'active').length,
        expired: certificates.filter(cert => cert.status === 'expired').length,
        levels: {
          bronze: certificates.filter(cert => cert.level === 'bronze').length,
          silver: certificates.filter(cert => cert.level === 'silver').length,
          gold: certificates.filter(cert => cert.level === 'gold').length,
          platinum: certificates.filter(cert => cert.level === 'platinum').length
        },
        averageScore: certificates.length > 0 ? 
          Math.round(certificates.reduce((sum, cert) => sum + cert.score, 0) / certificates.length) : 0
      };
      
      logger.info(`✅ Retrieved ${certificates.length} certificates`);
      
      res.json({
        success: true,
        message: 'User certificates retrieved successfully',
        data: {
          certificates,
          statistics: stats,
          recommendations: this.generateCertificationRecommendations(certificates)
        }
      });
      
    } catch (error) {
      logger.error('❌ Get User Certificates Error:', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        message: 'Failed to get certificates',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Verify certificate authenticity
   */
  static async verifyCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const { verificationCode } = req.query;
      
      if (!verificationCode) {
        return res.status(400).json({
          success: false,
          message: 'Verification code is required'
        });
      }
      
      logger.info(`🔍 Verifying certificate: ${certificateId}`);
      
      const verification = await RealCertificationService.verifyCertificate(certificateId, verificationCode);
      
      if (!verification.valid) {
        return res.status(404).json({
          success: false,
          message: verification.message
        });
      }
      
      logger.info(`✅ Certificate verified successfully`);
      
      res.json({
        success: true,
        message: verification.message,
        data: {
          certificate: {
            id: verification.certificate.certificateId,
            holder: {
              name: `${verification.certificate.user.firstName} ${verification.certificate.user.lastName}`,
              username: verification.certificate.user.username
            },
            skillArea: verification.certificate.skillArea,
            level: verification.certificate.level,
            score: verification.certificate.score,
            issuedDate: verification.certificate.issuedDate,
            expiryDate: verification.certificate.expiryDate,
            status: verification.certificate.status,
            issuer: verification.certificate.metadata.issuer
          },
          verificationDetails: {
            verifiedAt: new Date(),
            issuedBy: 'Travel Blog Platform Certification Authority',
            authentic: true
          }
        }
      });
      
    } catch (error) {
      logger.error('❌ Certificate Verification Error:', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to verify certificate',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Get certification leaderboard
   */
  static async getLeaderboard(req, res) {
    try {
      const { skillArea, limit = 20 } = req.query;
      
      logger.info(`🏆 Getting certification leaderboard for ${skillArea || 'all skills'}`);
      
      const leaderboard = await RealCertificationService.getCertificationLeaderboard(skillArea, parseInt(limit));
      
      logger.info(`✅ Retrieved ${leaderboard.length} certified users`);
      
      res.json({
        success: true,
        message: 'Certification leaderboard retrieved successfully',
        data: {
          leaderboard: leaderboard.map((entry, index) => ({
            rank: index + 1,
            user: {
              username: entry.user.username,
              name: `${entry.user.firstName} ${entry.user.lastName}`
            },
            totalCertificates: entry.totalCertificates,
            averageScore: Math.round(entry.averageScore),
            highestLevel: entry.highestLevel,
            latestCertification: entry.latestCertification
          })),
          skillArea: skillArea || 'all',
          totalEntries: leaderboard.length,
          updatedAt: new Date()
        }
      });
      
    } catch (error) {
      logger.error('❌ Certification Leaderboard Error:', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to get certification leaderboard',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Renew certificate
   */
  static async renewCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const userId = req.user.id;
      
      logger.info(`🔄 Renewing certificate: ${certificateId} for user: ${userId}`);
      
      const certificate = await Certificate.findOne({
        certificateId,
        user: userId
      });
      
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }
      
      if (certificate.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Only active certificates can be renewed'
        });
      }
      
      // Re-assess skill to ensure competency is maintained
      const assessment = await RealCertificationService.assessUserSkill(userId, certificate.skillArea);
      
      if (!assessment.eligible) {
        return res.status(400).json({
          success: false,
          message: 'Skill level no longer meets certification requirements',
          currentScore: assessment.overallScore,
          requiredScore: 70,
          recommendations: assessment.recommendations
        });
      }
      
      await certificate.renew();
      
      // Award points for renewal
      const RealGamificationService = require('../services/realGamificationService');
      await RealGamificationService.awardPoints(userId, 100, 'certificate renewal');
      
      logger.info(`✅ Certificate renewed successfully`);
      
      res.json({
        success: true,
        message: 'Certificate renewed successfully',
        data: {
          certificate,
          newExpiryDate: certificate.expiryDate,
          pointsAwarded: 100,
          validFor: '1 year'
        }
      });
      
    } catch (error) {
      logger.error('❌ Certificate Renewal Error:', { error: error.message, userId: req.user.id });
      res.status(500).json({
        success: false,
        message: 'Failed to renew certificate',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Get certification statistics
   */
  static async getStatistics(req, res) {
    try {
      logger.info('📊 Getting certification statistics');
      
      // Get comprehensive statistics
      const stats = await Certificate.aggregate([
        {
          $facet: {
            totalCertificates: [{ $count: 'count' }],
            bySkillArea: [
              { $group: { _id: '$skillArea', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            byLevel: [
              { $group: { _id: '$level', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            averageScore: [
              { $group: { _id: null, avgScore: { $avg: '$score' } } }
            ],
            monthlyIssuance: [
              {
                $group: {
                  _id: {
                    year: { $year: '$issuedDate' },
                    month: { $month: '$issuedDate' }
                  },
                  count: { $sum: 1 }
                }
              },
              { $sort: { '_id.year': -1, '_id.month': -1 } },
              { $limit: 12 }
            ]
          }
        }
      ]);
      
      const [statistics] = stats;
      
      logger.info(`✅ Retrieved certification statistics`);
      
      res.json({
        success: true,
        message: 'Certification statistics retrieved successfully',
        data: {
          overview: {
            totalCertificates: statistics.totalCertificates[0]?.count || 0,
            averageScore: Math.round(statistics.averageScore[0]?.avgScore || 0),
            mostPopularSkill: statistics.bySkillArea[0]?._id || 'N/A',
            mostCommonLevel: statistics.byLevel[0]?._id || 'N/A'
          },
          breakdown: {
            bySkillArea: statistics.bySkillArea,
            byLevel: statistics.byLevel,
            byStatus: statistics.byStatus
          },
          trends: {
            monthlyIssuance: statistics.monthlyIssuance
          },
          updatedAt: new Date()
        }
      });
      
    } catch (error) {
      logger.error('❌ Certification Statistics Error:', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Helper method to generate certification recommendations
   */
  static generateCertificationRecommendations(certificates) {
    const recommendations = [];
    
    const skillAreas = certificates.map(cert => cert.skillArea);
    const hasPhotography = skillAreas.includes('photography');
    const hasBlogging = skillAreas.includes('travel_blogging');
    const hasDestination = skillAreas.includes('destination_expert');
    
    if (hasBlogging && !hasPhotography) {
      recommendations.push({
        skillArea: 'photography',
        reason: 'Enhance your travel blogs with photography certification',
        priority: 'high'
      });
    }
    
    if (hasPhotography && !hasBlogging) {
      recommendations.push({
        skillArea: 'travel_blogging',
        reason: 'Combine your photography skills with storytelling',
        priority: 'high'
      });
    }
    
    if (certificates.length >= 3 && !hasDestination) {
      recommendations.push({
        skillArea: 'destination_expert',
        reason: 'Become a recognized destination authority',
        priority: 'medium'
      });
    }
    
    if (certificates.length === 0) {
      recommendations.push({
        skillArea: 'travel_blogging',
        reason: 'Great starting point for travel content creators',
        priority: 'high'
      });
    }
    
    return recommendations;
  }
}

module.exports = RealCertificationController;