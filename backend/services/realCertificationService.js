const Certificate = require('../models/Certificate');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const RealGamificationService = require('./realGamificationService');

class RealCertificationService {
  /**
   * REAL skill assessment system with comprehensive evaluation
   */
  static async assessUserSkill(userId, skillArea) {
    try {
      console.log(`🎓 CERT: Assessing ${skillArea} skill for user ${userId}`);
      
      // Get user data for assessment
      const user = await User.findById(userId);
      const userProgress = await UserProgress.findOne({ user: userId });
      const userBlogs = await Blog.find({ author: userId, isPublished: true });
      const userBookings = await Booking.find({ user: userId });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // REAL assessment based on actual user activity
      const assessmentScores = await this.calculateSkillScores(skillArea, {
        user,
        userProgress,
        blogs: userBlogs,
        bookings: userBookings
      });
      
      console.log(`📊 CERT: Assessment complete for ${skillArea}:`, assessmentScores);
      
      return {
        skillArea,
        overallScore: assessmentScores.overall,
        breakdown: assessmentScores.breakdown,
        level: this.determineCertificationLevel(assessmentScores.overall),
        eligible: assessmentScores.overall >= 70, // Minimum 70% to get certified
        recommendations: this.generateImprovementRecommendations(assessmentScores, skillArea)
      };
      
    } catch (error) {
      console.error('❌ CERT: Assessment error:', error.message);
      throw error;
    }
  }
  
  /**
   * REAL certification issuance with database persistence
   */
  static async issueCertification(userId, skillArea) {
    try {
      console.log(`🏆 CERT: Issuing certification for ${skillArea} to user ${userId}`);
      
      // Perform skill assessment
      const assessment = await this.assessUserSkill(userId, skillArea);
      
      if (!assessment.eligible) {
        throw new Error(`User does not meet certification requirements. Score: ${assessment.overallScore}%`);
      }
      
      // Check if user already has this certification
      const existingCert = await Certificate.findOne({
        user: userId,
        skillArea,
        status: 'active'
      });
      
      if (existingCert && existingCert.isValid()) {
        throw new Error('User already has an active certification for this skill area');
      }
      
      // Generate certificate details
      const certificateId = Certificate.generateCertificateId(skillArea, assessment.level);
      const verificationCode = Certificate.generateVerificationCode();
      
      // Create new certificate
      const certificate = new Certificate({
        user: userId,
        skillArea,
        level: assessment.level,
        score: assessment.overallScore,
        assessmentResults: {
          theoreticalScore: assessment.breakdown.knowledge,
          practicalScore: assessment.breakdown.experience,
          portfolioScore: assessment.breakdown.contribution,
          communityScore: assessment.breakdown.engagement,
          breakdown: assessment.breakdown
        },
        certificateId,
        verificationCode,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
        digitalBadge: this.generateDigitalBadge(skillArea, assessment.level),
        requirements: this.getCertificationRequirements(skillArea, assessment.level)
      });
      
      await certificate.save();
      
      // Award gamification points
      const pointsAwarded = this.getPointsForCertification(assessment.level);
      await RealGamificationService.awardPoints(userId, pointsAwarded, `${skillArea} certification`);
      
      // Track certification activity
      await RealGamificationService.trackActivity(userId, 'certifications_earned');
      
      console.log(`✅ CERT: Certificate issued successfully - ${certificateId}`);
      
      return {
        certificate,
        assessment,
        pointsAwarded,
        message: `Congratulations! You've earned a ${assessment.level} certification in ${skillArea}`
      };
      
    } catch (error) {
      console.error('❌ CERT: Certification issuance error:', error.message);
      throw error;
    }
  }
  
  /**
   * REAL skill score calculation based on user activity
   */
  static async calculateSkillScores(skillArea, userData) {
    const { user, userProgress, blogs, bookings } = userData;
    
    const scores = {
      knowledge: 0,
      experience: 0,
      contribution: 0,
      engagement: 0
    };
    
    // Calculate scores based on skill area
    switch (skillArea) {
      case 'travel_blogging':
        scores.knowledge = await this.assessBloggingKnowledge(blogs);
        scores.experience = await this.assessBloggingExperience(blogs, userProgress);
        scores.contribution = await this.assessBloggingContribution(blogs);
        scores.engagement = await this.assessBloggingEngagement(blogs, userProgress);
        break;
        
      case 'photography':
        scores.knowledge = await this.assessPhotographyKnowledge(blogs);
        scores.experience = await this.assessPhotographyExperience(userProgress);
        scores.contribution = await this.assessPhotographyContribution(blogs);
        scores.engagement = await this.assessPhotographyEngagement(userProgress);
        break;
        
      case 'destination_expert':
        scores.knowledge = await this.assessDestinationKnowledge(blogs, bookings);
        scores.experience = await this.assessDestinationExperience(bookings);
        scores.contribution = await this.assessDestinationContribution(blogs);
        scores.engagement = await this.assessDestinationEngagement(userProgress);
        break;
        
      default:
        // Generic assessment for other skill areas
        scores.knowledge = await this.assessGenericKnowledge(blogs, userProgress);
        scores.experience = await this.assessGenericExperience(userProgress, bookings);
        scores.contribution = await this.assessGenericContribution(blogs, userProgress);
        scores.engagement = await this.assessGenericEngagement(userProgress);
    }
    
    // Calculate overall score (weighted average)
    const overall = Math.round(
      (scores.knowledge * 0.3 + 
       scores.experience * 0.3 + 
       scores.contribution * 0.25 + 
       scores.engagement * 0.15)
    );
    
    return {
      overall: Math.min(100, overall),
      breakdown: scores
    };
  }
  
  /**
   * REAL blogging knowledge assessment
   */
  static async assessBloggingKnowledge(blogs) {
    let score = 0;
    
    // Quality indicators
    const avgWordCount = blogs.length > 0 ? 
      blogs.reduce((sum, blog) => sum + (blog.content?.length || 0), 0) / blogs.length : 0;
    
    // Word count scoring (longer posts generally indicate more knowledge)
    if (avgWordCount > 2000) score += 40;
    else if (avgWordCount > 1000) score += 30;
    else if (avgWordCount > 500) score += 20;
    else score += 10;
    
    // Category diversity (knowledge across different topics)
    const categories = new Set(blogs.map(blog => blog.category?.toString()).filter(Boolean));
    score += Math.min(25, categories.size * 5);
    
    // SEO and structure indicators
    const blogsWithTags = blogs.filter(blog => blog.tags?.length > 0);
    score += Math.min(20, (blogsWithTags.length / Math.max(blogs.length, 1)) * 20);
    
    // Consistency (regular posting)
    if (blogs.length >= 20) score += 15;
    else if (blogs.length >= 10) score += 10;
    else if (blogs.length >= 5) score += 5;
    
    return Math.min(100, score);
  }
  
  /**
   * REAL blogging experience assessment
   */
  static async assessBloggingExperience(blogs, userProgress) {
    let score = 0;
    
    // Total blogs published
    const blogCount = blogs.length;
    if (blogCount >= 50) score += 40;
    else if (blogCount >= 25) score += 30;
    else if (blogCount >= 10) score += 20;
    else if (blogCount >= 5) score += 10;
    
    // Account age and consistency
    const accountAge = userProgress ? 
      (Date.now() - new Date(userProgress.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
    
    if (accountAge > 365) score += 25; // Over 1 year
    else if (accountAge > 180) score += 15; // Over 6 months
    else if (accountAge > 90) score += 10; // Over 3 months
    
    // Publishing frequency
    const avgDaysBetweenPosts = accountAge / Math.max(blogCount, 1);
    if (avgDaysBetweenPosts < 7) score += 20; // Weekly or more
    else if (avgDaysBetweenPosts < 14) score += 15; // Bi-weekly
    else if (avgDaysBetweenPosts < 30) score += 10; // Monthly
    
    // Featured content or high-performing posts
    const highPerformingPosts = blogs.filter(blog => (blog.likes || 0) > 20);
    score += Math.min(15, highPerformingPosts.length * 3);
    
    return Math.min(100, score);
  }
  
  /**
   * REAL blogging contribution assessment
   */
  static async assessBloggingContribution(blogs) {
    let score = 0;
    
    // Community engagement through likes received
    const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
    if (totalLikes > 500) score += 30;
    else if (totalLikes > 200) score += 25;
    else if (totalLikes > 100) score += 20;
    else if (totalLikes > 50) score += 15;
    else if (totalLikes > 10) score += 10;
    
    // Comments received (engagement quality)
    const totalComments = blogs.reduce((sum, blog) => sum + (blog.comments || 0), 0);
    if (totalComments > 200) score += 25;
    else if (totalComments > 100) score += 20;
    else if (totalComments > 50) score += 15;
    else if (totalComments > 20) score += 10;
    
    // Views (reach and impact)
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
    if (totalViews > 10000) score += 25;
    else if (totalViews > 5000) score += 20;
    else if (totalViews > 2000) score += 15;
    else if (totalViews > 500) score += 10;
    
    // Content uniqueness (original destinations/topics)
    const uniqueDestinations = new Set(blogs.map(blog => blog.destination).filter(Boolean));
    score += Math.min(20, uniqueDestinations.size * 2);
    
    return Math.min(100, score);
  }
  
  /**
   * REAL blogging engagement assessment
   */
  static async assessBloggingEngagement(blogs, userProgress) {
    let score = 0;
    
    // Social interaction scores from user progress
    if (userProgress) {
      const activities = userProgress.activities || {};
      
      // Comments made by user (community participation)
      score += Math.min(30, (activities.comments_made || 0) * 2);
      
      // Users followed (networking)
      score += Math.min(25, (activities.users_followed || 0) * 3);
      
      // Login frequency (platform engagement)
      score += Math.min(25, (activities.daily_logins || 0) * 0.5);
    }
    
    // Recent activity (engagement recency)
    const recentBlogs = blogs.filter(blog => {
      const daysSincePost = (Date.now() - new Date(blog.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSincePost <= 30;
    });
    
    score += Math.min(20, recentBlogs.length * 5);
    
    return Math.min(100, score);
  }
  
  /**
   * Helper methods for other skill areas
   */
  static async assessPhotographyKnowledge(blogs) {
    // Count blogs with images, quality indicators
    const blogsWithImages = blogs.filter(blog => blog.images?.length > 0);
    return Math.min(100, (blogsWithImages.length / Math.max(blogs.length, 1)) * 100);
  }
  
  static async assessPhotographyExperience(userProgress) {
    const photosUploaded = userProgress?.activities?.photos_uploaded || 0;
    return Math.min(100, photosUploaded * 5);
  }
  
  static async assessDestinationKnowledge(blogs, bookings) {
    const uniqueDestinations = new Set([
      ...blogs.map(blog => blog.destination).filter(Boolean),
      ...bookings.map(booking => booking.destination).filter(Boolean)
    ]);
    return Math.min(100, uniqueDestinations.size * 10);
  }
  
  static async assessDestinationExperience(bookings) {
    const totalBookings = bookings.length;
    return Math.min(100, totalBookings * 15);
  }
  
  // Generic assessment methods for other skill areas
  static async assessGenericKnowledge(blogs, userProgress) {
    return Math.min(100, blogs.length * 10 + (userProgress?.totalPoints || 0) * 0.1);
  }
  
  static async assessGenericExperience(userProgress, bookings) {
    const experience = (userProgress?.totalPoints || 0) * 0.05 + bookings.length * 10;
    return Math.min(100, experience);
  }
  
  static async assessGenericContribution(blogs, userProgress) {
    const contribution = blogs.length * 5 + (userProgress?.totalPoints || 0) * 0.05;
    return Math.min(100, contribution);
  }
  
  static async assessGenericEngagement(userProgress) {
    if (!userProgress) return 0;
    const activities = userProgress.activities || {};
    const engagement = Object.values(activities).reduce((sum, count) => sum + count, 0) * 2;
    return Math.min(100, engagement);
  }
  
  /**
   * Additional helper methods
   */
  static determineCertificationLevel(score) {
    if (score >= 95) return 'platinum';
    if (score >= 85) return 'gold';
    if (score >= 75) return 'silver';
    return 'bronze';
  }
  
  static getPointsForCertification(level) {
    const points = {
      bronze: 500,
      silver: 1000,
      gold: 2000,
      platinum: 5000
    };
    return points[level] || 500;
  }
  
  static generateDigitalBadge(skillArea, level) {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    
    return {
      imageUrl: `/badges/${skillArea}_${level}.png`,
      badgeColor: colors[level],
      achievements: [`${level.toUpperCase()} ${skillArea.replace('_', ' ')} Specialist`]
    };
  }
  
  static getCertificationRequirements(skillArea, level) {
    const baseRequirements = {
      bronze: { minimumPosts: 5, minimumLikes: 10, minimumFollowers: 0 },
      silver: { minimumPosts: 15, minimumLikes: 50, minimumFollowers: 10 },
      gold: { minimumPosts: 30, minimumLikes: 150, minimumFollowers: 25 },
      platinum: { minimumPosts: 50, minimumLikes: 500, minimumFollowers: 50 }
    };
    
    return {
      ...baseRequirements[level],
      assessmentPassed: true,
      portfolioSubmitted: level === 'gold' || level === 'platinum'
    };
  }
  
  static generateImprovementRecommendations(scores, skillArea) {
    const recommendations = [];
    
    if (scores.breakdown.knowledge < 70) {
      recommendations.push(`Improve your ${skillArea} knowledge by reading industry guides and best practices`);
    }
    
    if (scores.breakdown.experience < 70) {
      recommendations.push(`Gain more hands-on experience in ${skillArea} through practice and projects`);
    }
    
    if (scores.breakdown.contribution < 70) {
      recommendations.push('Increase your community contributions by creating more engaging content');
    }
    
    if (scores.breakdown.engagement < 70) {
      recommendations.push('Boost your engagement by actively participating in community discussions');
    }
    
    return recommendations;
  }
  
  /**
   * Verify certificate authenticity
   */
  static async verifyCertificate(certificateId, verificationCode) {
    try {
      console.log(`🔍 CERT: Verifying certificate ${certificateId}`);
      
      const certificate = await Certificate.verifyCertificate(certificateId, verificationCode);
      
      if (!certificate) {
        return {
          valid: false,
          message: 'Certificate not found or invalid'
        };
      }
      
      await certificate.populate('user', 'username firstName lastName');
      
      console.log(`✅ CERT: Certificate verified successfully`);
      
      return {
        valid: true,
        certificate,
        message: 'Certificate is valid and active'
      };
      
    } catch (error) {
      console.error('❌ CERT: Verification error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get certification leaderboard
   */
  static async getCertificationLeaderboard(skillArea = null, limit = 20) {
    try {
      console.log(`🏆 CERT: Getting certification leaderboard for ${skillArea || 'all skills'}`);
      
      const leaderboard = await Certificate.getTopCertifiedUsers(skillArea, limit);
      
      console.log(`✅ CERT: Retrieved ${leaderboard.length} certified users`);
      
      return leaderboard;
      
    } catch (error) {
      console.error('❌ CERT: Leaderboard error:', error.message);
      throw error;
    }
  }
}

module.exports = RealCertificationService;