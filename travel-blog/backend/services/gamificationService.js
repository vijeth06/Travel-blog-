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
      await challenge.save();
      
      // Notify all users about the new challenge
      if (challenge.scope === 'global') {
        await this.notifyUsersAboutChallenge(challenge);
      }

      return challenge;

    } catch (error) {
      console.error('Create challenge error:', error);
      throw new Error('Failed to create challenge');
    }
  }

  async joinChallenge(userId, challengeId) {
    try {
      const challenge = await TravelChallenge.findById(challengeId);
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (!challenge.isActive()) {
        throw new Error('Challenge is not active');
      }

      if (challenge.participants.length >= challenge.maxParticipants) {
        throw new Error('Challenge is full');
      }

      // Check if user already joined
      const existingParticipant = challenge.participants.find(
        p => p.user.toString() === userId
      );

      if (existingParticipant) {
        throw new Error('Already joined this challenge');
      }

      // Add participant
      challenge.participants.push({
        user: userId,
        joinedAt: new Date(),
        progress: 0,
        status: 'active'
      });

      await challenge.save();

      // Update user's joined challenges
      await User.findByIdAndUpdate(userId, {
        $addToSet: { 'gamification.joinedChallenges': challengeId }
      });

      return challenge;

    } catch (error) {
      console.error('Join challenge error:', error);
      throw new Error('Failed to join challenge');
    }
  }

  async updateChallengeProgress(userId, challengeId, progressData) {
    try {
      const challenge = await TravelChallenge.findById(challengeId);
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      const participant = challenge.participants.find(
        p => p.user.toString() === userId
      );

      if (!participant) {
        throw new Error('User not participating in this challenge');
      }

      // Update progress based on challenge type
      let newProgress = progressData.progress || participant.progress;
      
      if (challenge.type === 'step') {
        newProgress = Math.min(progressData.steps || 0, challenge.target);
      } else if (challenge.type === 'collection') {
        newProgress = Math.min(progressData.items?.length || 0, challenge.target);
      } else if (challenge.type === 'achievement') {
        newProgress = progressData.achieved ? challenge.target : 0;
      }

      participant.progress = newProgress;
      participant.lastUpdate = new Date();

      // Check if challenge completed
      if (newProgress >= challenge.target && participant.status !== 'completed') {
        participant.status = 'completed';
        participant.completedAt = new Date();
        
        // Award points and badges
        await this.awardChallengeCompletion(userId, challenge);
      }

      await challenge.save();
      return challenge;

    } catch (error) {
      console.error('Update challenge progress error:', error);
      throw new Error('Failed to update challenge progress');
    }
  }

  async awardPoints(userId, actionType, amount = null) {
    try {
      const points = amount || this.pointValues[actionType] || 0;
      
      if (points === 0) return;

      const user = await User.findById(userId);
      if (!user) return;

      // Initialize gamification if not exists
      if (!user.gamification) {
        user.gamification = {
          points: 0,
          level: 1,
          badges: [],
          achievements: {},
          joinedChallenges: []
        };
      }

      // Add points
      user.gamification.points += points;

      // Update level (every 1000 points = 1 level)
      const newLevel = Math.floor(user.gamification.points / 1000) + 1;
      const leveledUp = newLevel > user.gamification.level;
      user.gamification.level = newLevel;

      // Record achievement
      if (!user.gamification.achievements[actionType]) {
        user.gamification.achievements[actionType] = 0;
      }
      user.gamification.achievements[actionType]++;

      await user.save();

      // Check for new badges
      await this.checkAndAwardBadges(userId);

      // Send level up notification
      if (leveledUp) {
        await this.sendLevelUpNotification(user, newLevel);
      }

      return {
        pointsAwarded: points,
        totalPoints: user.gamification.points,
        level: user.gamification.level,
        leveledUp
      };

    } catch (error) {
      console.error('Award points error:', error);
      throw new Error('Failed to award points');
    }
  }

  async checkAndAwardBadges(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.gamification) return;

      const newBadges = [];

      // Check each badge requirement
      for (const [badgeId, badge] of Object.entries(this.badgeDefinitions)) {
        // Skip if user already has this badge
        if (user.gamification.badges.some(b => b.badgeId === badgeId)) {
          continue;
        }

        const requirement = badge.requirement;
        let achieved = false;

        // Check achievement based on requirement type
        if (requirement.type === 'countries_visited') {
          // You'd need to track this in user achievements
          achieved = (user.gamification.achievements.countries_visited || 0) >= requirement.count;
        } else if (requirement.type === 'blogs_written') {
          achieved = (user.gamification.achievements['blog-post'] || 0) >= requirement.count;
        } else if (requirement.type === 'photos_uploaded') {
          achieved = (user.gamification.achievements['photo-upload'] || 0) >= requirement.count;
        } else if (requirement.type === 'reviews_written') {
          achieved = (user.gamification.achievements['review-submit'] || 0) >= requirement.count;
        }
        // Add more requirement checks as needed

        if (achieved) {
          const newBadge = {
            badgeId,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            awardedAt: new Date(),
            points: badge.points
          };

          user.gamification.badges.push(newBadge);
          user.gamification.points += badge.points;
          newBadges.push(newBadge);
        }
      }

      if (newBadges.length > 0) {
        await user.save();
        await this.sendBadgeNotifications(user, newBadges);
      }

      return newBadges;

    } catch (error) {
      console.error('Check and award badges error:', error);
      throw new Error('Failed to check badges');
    }
  }

  async getLeaderboard(timeframe = 'all', limit = 100) {
    try {
      let matchQuery = { 'gamification.points': { $gt: 0 } };

      // Add time-based filtering if needed
      if (timeframe === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        // You'd need to track when points were earned for this
      } else if (timeframe === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // You'd need to track when points were earned for this
      }

      const leaderboard = await User.find(matchQuery)
        .select('name avatar gamification location')
        .sort({ 'gamification.points': -1 })
        .limit(limit);

      // Add rank
      const rankedLeaderboard = leaderboard.map((user, index) => ({
        rank: index + 1,
        user: {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          location: user.location
        },
        points: user.gamification.points,
        level: user.gamification.level,
        badges: user.gamification.badges.length
      }));

      return rankedLeaderboard;

    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw new Error('Failed to get leaderboard');
    }
  }

  async getUserStats(userId) {
    try {
      const user = await User.findById(userId).select('gamification');
      
      if (!user || !user.gamification) {
        return {
          points: 0,
          level: 1,
          badges: [],
          achievements: {},
          rank: null
        };
      }

      // Get user's rank
      const rank = await User.countDocuments({
        'gamification.points': { $gt: user.gamification.points }
      }) + 1;

      return {
        points: user.gamification.points,
        level: user.gamification.level,
        badges: user.gamification.badges,
        achievements: user.gamification.achievements,
        rank
      };

    } catch (error) {
      console.error('Get user stats error:', error);
      throw new Error('Failed to get user stats');
    }
  }

  async getActiveChallenges(userId = null) {
    try {
      const now = new Date();
      let query = {
        startDate: { $lte: now },
        endDate: { $gte: now },
        status: 'active'
      };

      // If userId provided, include user's participation status
      const challenges = await TravelChallenge.find(query)
        .populate('createdBy', 'name avatar')
        .sort({ startDate: -1 });

      if (userId) {
        return challenges.map(challenge => {
          const participant = challenge.participants.find(
            p => p.user.toString() === userId
          );
          
          return {
            ...challenge.toObject(),
            userParticipation: participant || null,
            isParticipating: !!participant
          };
        });
      }

      return challenges;

    } catch (error) {
      console.error('Get active challenges error:', error);
      throw new Error('Failed to get active challenges');
    }
  }

  async awardChallengeCompletion(userId, challenge) {
    try {
      // Award challenge points
      await this.awardPoints(userId, 'challenge-complete', challenge.rewards.points);

      // Award any specific badges
      if (challenge.rewards.badges && challenge.rewards.badges.length > 0) {
        const user = await User.findById(userId);
        
        for (const badgeId of challenge.rewards.badges) {
          if (this.badgeDefinitions[badgeId]) {
            const badge = this.badgeDefinitions[badgeId];
            const newBadge = {
              badgeId,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              awardedAt: new Date(),
              points: badge.points,
              source: 'challenge',
              sourceId: challenge._id
            };

            user.gamification.badges.push(newBadge);
            user.gamification.points += badge.points;
          }
        }

        await user.save();
      }

      // Send completion notification
      await this.sendChallengeCompletionNotification(userId, challenge);

    } catch (error) {
      console.error('Award challenge completion error:', error);
      throw new Error('Failed to award challenge completion');
    }
  }

  async sendLevelUpNotification(user, newLevel) {
    try {
      await sendEmail({
        to: user.email,
        subject: `🎉 Level Up! You're now Level ${newLevel}!`,
        template: 'level-up',
        data: {
          userName: user.name,
          newLevel,
          totalPoints: user.gamification.points
        }
      });
    } catch (error) {
      console.error('Send level up notification error:', error);
    }
  }

  async sendBadgeNotifications(user, badges) {
    try {
      await sendEmail({
        to: user.email,
        subject: `🏆 New Badge${badges.length > 1 ? 's' : ''} Earned!`,
        template: 'badge-earned',
        data: {
          userName: user.name,
          badges,
          totalBadges: user.gamification.badges.length
        }
      });
    } catch (error) {
      console.error('Send badge notifications error:', error);
    }
  }

  async sendChallengeCompletionNotification(userId, challenge) {
    try {
      const user = await User.findById(userId);
      
      await sendEmail({
        to: user.email,
        subject: `🎯 Challenge Completed: ${challenge.title}`,
        template: 'challenge-complete',
        data: {
          userName: user.name,
          challengeTitle: challenge.title,
          pointsEarned: challenge.rewards.points
        }
      });
    } catch (error) {
      console.error('Send challenge completion notification error:', error);
    }
  }

  async notifyUsersAboutChallenge(challenge) {
    try {
      // This would be a batch email - implement according to your email service capabilities
      console.log(`New global challenge created: ${challenge.title}`);
      // You might want to implement this with a queue system for large user bases
    } catch (error) {
      console.error('Notify users about challenge error:', error);
    }
  }
}

module.exports = new GamificationService();