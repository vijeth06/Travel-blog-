const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const TravelChallenge = require('../models/TravelChallenge');

/**
 * Real-time Gamification Service
 * Handles points, achievements, levels, and notifications with actual database operations
 */
class GamificationService {
  
  constructor() {
    this.pointValues = {
      'blog_created': 100,
      'blog_published': 150,
      'review_written': 75,
      'photo_uploaded': 25,
      'place_visited': 200,
      'trip_planned': 100,
      'friend_referred': 500,
      'challenge_completed': 300,
      'package_booked': 150,
      'comment_posted': 10,
      'like_received': 5,
      'share_received': 15,
      'profile_completed': 200,
      'login_streak': 50,
      'first_time': 1000,
      'milestone': 500
    };
  }
  
  /**
   * Award points to user for specific activity with real database operations
   */
  async awardPoints(userId, activity, points = 0, metadata = {}) {
    try {
      console.log(`🎯 Awarding points: ${activity} to user ${userId}`);
      
      // Get or create user progress
      let userProgress = await UserProgress.findOne({ user: userId });
      if (!userProgress) {
        userProgress = new UserProgress({ user: userId });
        console.log(`📊 Created new user progress for ${userId}`);
      }
      
      const pointsToAward = points || this.pointValues[activity] || 0;
      
      // Award points and check for level up
      const result = userProgress.addExperiencePoints(pointsToAward, activity);
      
      // Update activity counters
      await this.updateActivityCounters(userProgress, activity, metadata);
      
      // Update login streak if applicable
      if (activity === 'daily_login') {
        const streakDays = userProgress.updateLoginStreak();
        if (streakDays > 1) {
          result.streakBonus = streakDays * 10;
          userProgress.experiencePoints += result.streakBonus;
        }
      }
      
      await userProgress.save();
      console.log(`💾 Saved user progress: ${userProgress.experiencePoints} points, level ${userProgress.level}`);
      
      // Check for new achievements
      const newAchievements = await this.checkAchievements(userId, userProgress);
      
      // Send real-time notification
      await this.sendRealTimeUpdate(userId, {
        type: 'points_awarded',
        points: pointsToAward,
        activity,
        levelUp: result.leveledUp,
        newLevel: result.newLevel,
        newAchievements,
        totalPoints: userProgress.experiencePoints,
        metadata
      });
      
      return {
        success: true,
        pointsAwarded: pointsToAward,
        totalPoints: userProgress.experiencePoints,
        level: userProgress.level,
        leveledUp: result.leveledUp,
        newAchievements,
        userProgress
      };
      
    } catch (error) {
      console.error('❌ Award points error:', error);
      throw new Error(`Failed to award points: ${error.message}`);
    }
  }
  
  /**
   * Update activity counters based on activity type
   */
  async updateActivityCounters(userProgress, activity, metadata) {
    const activityMappings = {
      'blog_created': 'blogsWritten',
      'blog_published': 'blogsWritten',
      'review_written': 'reviewsWritten',
      'photo_uploaded': 'photosUploaded',
      'place_visited': 'placesVisited',
      'trip_planned': 'tripsPlanned',
      'friend_referred': 'friendsReferred',
      'challenge_completed': 'challengesCompleted',
      'package_booked': 'packagesBooked',
      'comment_posted': 'commentsPosted',
      'like_received': 'likesReceived',
      'share_received': 'sharesReceived'
    };
    
    if (activityMappings[activity]) {
      userProgress.incrementActivity(activityMappings[activity]);
      console.log(`📈 Updated activity: ${activityMappings[activity]} = ${userProgress.activities[activityMappings[activity]]}`);
    }
    
    // Handle special cases
    if (metadata.placeId && activity === 'place_visited') {
      // Track unique places visited
      if (!userProgress.preferences.favoriteDestinations.includes(metadata.placeId)) {
        userProgress.preferences.favoriteDestinations.push(metadata.placeId);
      }
    }
  }
  
  /**
   * Check and award achievements with real database operations
   */
  async checkAchievements(userId, userProgress = null) {
    try {
      console.log(`🏆 Checking achievements for user ${userId}`);
      
      if (!userProgress) {
        userProgress = await UserProgress.findOne({ user: userId });
        if (!userProgress) return [];
      }
      
      // Get all active achievements
      const achievements = await Achievement.find({ isActive: true });
      const newAchievements = [];
      
      for (const achievement of achievements) {
        // Check if user already has this achievement
        const hasAchievement = userProgress.achievements.some(
          a => a.achievementId.toString() === achievement._id.toString()
        );
        
        if (!hasAchievement && achievement.checkRequirements(userProgress)) {
          console.log(`🎉 New achievement unlocked: ${achievement.name}`);
          
          // Award achievement
          userProgress.achievements.push({
            achievementId: achievement._id,
            progress: 100,
            unlockedAt: new Date()
          });
          
          // Award achievement points
          userProgress.experiencePoints += achievement.points;
          
          // Create badge
          const badge = {
            badgeId: achievement._id.toString(),
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            earnedAt: new Date()
          };
          
          userProgress.badges.push(badge);
          newAchievements.push({ achievement, badge });
          
          // Send real-time achievement notification
          await this.sendRealTimeUpdate(userId, {
            type: 'achievement_unlocked',
            achievement: {
              id: achievement._id,
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              points: achievement.points,
              rarity: achievement.rarity
            }
          });
        }
      }
      
      if (newAchievements.length > 0) {
        await userProgress.save();
        console.log(`💾 Saved ${newAchievements.length} new achievements`);
      }
      
      return newAchievements;
      
    } catch (error) {
      console.error('❌ Check achievements error:', error);
      return [];
    }
  }
  
  /**
   * Get user's complete gamification data
   */
  async getUserProgress(userId) {
    try {
      console.log(`📊 Getting user progress for ${userId}`);
      
      let userProgress = await UserProgress.findOne({ user: userId })
        .populate('achievements.achievementId')
        .populate('user', 'username avatar email');
      
      if (!userProgress) {
        // Create new user progress
        userProgress = new UserProgress({ user: userId });
        await userProgress.save();
        console.log(`✨ Created new user progress for ${userId}`);
        
        userProgress = await UserProgress.findOne({ user: userId })
          .populate('achievements.achievementId')
          .populate('user', 'username avatar email');
      }
      
      // Calculate additional stats
      const pointsToNextLevel = userProgress.pointsToNextLevel();
      const completionPercentage = (userProgress.experiencePoints % 1000) / 10;
      
      // Get user's rank
      const rank = await this.getUserRank(userId);
      
      return {
        ...userProgress.toObject(),
        pointsToNextLevel,
        completionPercentage,
        rank
      };
      
    } catch (error) {
      console.error('❌ Get user progress error:', error);
      throw new Error(`Failed to get user progress: ${error.message}`);
    }
  }
  
  /**
   * Get real leaderboard from database
   */
  async getLeaderboard(period = 'all', limit = 10) {
    try {
      console.log(`🏆 Getting leaderboard: ${period}, limit: ${limit}`);
      
      const leaderboard = await UserProgress.getLeaderboard(limit, period);
      
      console.log(`📊 Retrieved ${leaderboard.length} leaderboard entries`);
      return leaderboard;
    } catch (error) {
      console.error('❌ Get leaderboard error:', error);
      throw new Error(`Failed to get leaderboard: ${error.message}`);
    }
  }
  
  /**
   * Get user's current rank
   */
  async getUserRank(userId) {
    try {
      const userProgress = await UserProgress.findOne({ user: userId });
      if (!userProgress) return null;
      
      const rank = await UserProgress.countDocuments({
        experiencePoints: { $gt: userProgress.experiencePoints }
      });
      
      return rank + 1; // +1 because rank starts from 1
    } catch (error) {
      console.error('❌ Get user rank error:', error);
      return null;
    }
  }
  
  /**
   * Create real challenge with database persistence
   */
  async createChallenge(challengeData) {
    try {
      console.log('🎯 Creating new challenge:', challengeData.title);
      
      const challenge = new TravelChallenge({
        ...challengeData,
        participants: [],
        isActive: true,
        createdAt: new Date()
      });
      
      await challenge.save();
      console.log(`💾 Challenge created with ID: ${challenge._id}`);
      
      return challenge;
    } catch (error) {
      console.error('❌ Create challenge error:', error);
      throw new Error(`Failed to create challenge: ${error.message}`);
    }
  }
  
  /**
   * Join challenge with real database operations
   */
  async joinChallenge(userId, challengeId) {
    try {
      console.log(`🎯 User ${userId} joining challenge ${challengeId}`);
      
      const challenge = await TravelChallenge.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      if (challenge.participants.includes(userId)) {
        throw new Error('Already joined this challenge');
      }
      
      challenge.participants.push(userId);
      await challenge.save();
      
      // Award points for joining
      await this.awardPoints(userId, 'challenge_joined', 50, { challengeId });
      
      console.log(`✅ User joined challenge successfully`);
      
      return {
        success: true,
        message: 'Successfully joined challenge',
        pointsAwarded: 50,
        challenge
      };
    } catch (error) {
      console.error('❌ Join challenge error:', error);
      throw new Error(`Failed to join challenge: ${error.message}`);
    }
  }
  
  /**
   * Update challenge progress with real tracking
   */
  async updateChallengeProgress(userId, challengeId, progressData) {
    try {
      console.log(`📈 Updating challenge progress: ${progressData.percentComplete}%`);
      
      // Award points based on progress
      const pointsAwarded = Math.floor(progressData.percentComplete * 10);
      
      if (progressData.percentComplete >= 100) {
        // Challenge completed
        await this.awardPoints(userId, 'challenge_completed', 300, { challengeId });
        console.log('🎉 Challenge completed!');
      } else {
        await this.awardPoints(userId, 'challenge_progress', pointsAwarded, { 
          challengeId, 
          progress: progressData.percentComplete 
        });
      }
      
      return {
        success: true,
        progress: progressData.percentComplete,
        pointsAwarded: progressData.percentComplete >= 100 ? 300 : pointsAwarded
      };
    } catch (error) {
      console.error('❌ Update challenge progress error:', error);
      throw new Error(`Failed to update challenge progress: ${error.message}`);
    }
  }
  
  /**
   * Send real-time updates via Socket.io
   */
  async sendRealTimeUpdate(userId, data) {
    try {
      // Import io from app.js at runtime to avoid circular dependency
      const { getIO } = require('../app');
      const io = getIO();
      
      if (io) {
        io.to(`user_${userId}`).emit('gamification_update', data);
        console.log(`📡 Sent real-time update to user ${userId}:`, data.type);
      }
    } catch (error) {
      console.error('❌ Send real-time update error:', error);
    }
  }
  
  /**
   * Track activity and award points automatically
   */
  async trackActivity(userId, activityType, metadata = {}) {
    try {
      console.log(`🔍 Tracking activity: ${activityType} for user ${userId}`);
      return await this.awardPoints(userId, activityType, null, metadata);
    } catch (error) {
      console.error('❌ Track activity error:', error);
      throw new Error(`Failed to track activity: ${error.message}`);
    }
  }
  
  /**
   * Initialize default achievements in database
   */
  async initializeDefaultAchievements() {
    try {
      console.log('🏆 Initializing default achievements...');
      await Achievement.createDefaultAchievements();
      console.log('✅ Default achievements initialized successfully');
    } catch (error) {
      console.error('❌ Initialize achievements error:', error);
    }
  }
  
  /**
   * Get user statistics for dashboard
   */
  async getUserStats(userId) {
    try {
      const userProgress = await this.getUserProgress(userId);
      const rank = await this.getUserRank(userId);
      const recentAchievements = userProgress.achievements
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
        .slice(0, 5);
      
      return {
        level: userProgress.level,
        experiencePoints: userProgress.experiencePoints,
        pointsToNextLevel: userProgress.pointsToNextLevel,
        rank,
        totalAchievements: userProgress.achievements.length,
        totalBadges: userProgress.badges.length,
        currentStreak: userProgress.streaks?.currentLoginStreak || 0,
        activitiesCompleted: Object.values(userProgress.activities).reduce((sum, val) => sum + val, 0),
        recentAchievements
      };
    } catch (error) {
      console.error('❌ Get user stats error:', error);
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  /**
   * Check level progression for user
   */
  async checkLevelProgression(userId) {
    try {
      console.log(`📈 Checking level progression for user ${userId}`);
      
      const userProgress = await UserProgress.findOne({ user: userId });
      if (!userProgress) {
        return {
          success: false,
          message: 'User progress not found'
        };
      }
      
      const currentLevel = userProgress.level;
      const newLevel = Math.floor(userProgress.experiencePoints / 1000) + 1;
      
      if (newLevel > currentLevel) {
        userProgress.level = newLevel;
        await userProgress.save();
        
        console.log(`🎉 User ${userId} leveled up to level ${newLevel}`);
        
        // Send real-time update
        await this.sendRealTimeUpdate(userId, {
          type: 'level_up',
          newLevel,
          previousLevel: currentLevel
        });
      }
      
      return {
        success: true,
        data: {
          currentLevel: userProgress.level,
          previousLevel: currentLevel,
          leveledUp: newLevel > currentLevel
        }
      };
      
    } catch (error) {
      console.error(`❌ Check level progression error for user ${userId}:`, error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new GamificationService();