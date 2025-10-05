const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Experience points and levels
  experiencePoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  // Activity counters
  activities: {
    blogsWritten: { type: Number, default: 0 },
    reviewsWritten: { type: Number, default: 0 },
    photosUploaded: { type: Number, default: 0 },
    placesVisited: { type: Number, default: 0 },
    tripsPlanned: { type: Number, default: 0 },
    friendsReferred: { type: Number, default: 0 },
    challengesCompleted: { type: Number, default: 0 },
    packagesBooked: { type: Number, default: 0 },
    commentsPosted: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    sharesReceived: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    consecutiveDaysActive: { type: Number, default: 0 },
    totalDaysActive: { type: Number, default: 0 }
  },
  // Achievements
  achievements: [{
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  // Badges
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['traveler', 'blogger', 'social', 'explorer', 'expert', 'premium']
    }
  }],
  // Streaks
  streaks: {
    currentLoginStreak: { type: Number, default: 0 },
    longestLoginStreak: { type: Number, default: 0 },
    lastLoginDate: Date,
    currentPostingStreak: { type: Number, default: 0 },
    longestPostingStreak: { type: Number, default: 0 },
    lastPostDate: Date
  },
  // Preferences and stats
  preferences: {
    favoriteDestinations: [String],
    travelStyle: {
      type: String,
      enum: ['budget', 'luxury', 'adventure', 'cultural', 'relaxation', 'business']
    },
    interests: [String]
  },
  // Monthly and yearly stats
  monthlyStats: [{
    month: Number,
    year: Number,
    pointsEarned: Number,
    activitiesCompleted: Number,
    milestonesReached: Number
  }],
  // Leaderboard position
  leaderboardRank: {
    global: Number,
    monthly: Number,
    category: Number
  },
  // Notifications settings
  notifications: {
    achievementUnlocked: { type: Boolean, default: true },
    levelUp: { type: Boolean, default: true },
    challengeInvite: { type: Boolean, default: true },
    leaderboardUpdate: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes for performance
userProgressSchema.index({ user: 1 });
userProgressSchema.index({ experiencePoints: -1 });
userProgressSchema.index({ level: -1 });
userProgressSchema.index({ 'streaks.currentLoginStreak': -1 });

// Virtual for calculating level based on experience points
userProgressSchema.virtual('calculatedLevel').get(function() {
  return Math.floor(this.experiencePoints / 1000) + 1;
});

// Method to calculate points needed for next level
userProgressSchema.methods.pointsToNextLevel = function() {
  const nextLevel = this.level + 1;
  const pointsNeeded = nextLevel * 1000;
  return pointsNeeded - this.experiencePoints;
};

// Method to add experience points
userProgressSchema.methods.addExperiencePoints = function(points, activity = 'general') {
  this.experiencePoints += points;
  const newLevel = this.calculatedLevel;
  
  if (newLevel > this.level) {
    this.level = newLevel;
    return { leveledUp: true, newLevel, pointsAdded: points };
  }
  
  return { leveledUp: false, pointsAdded: points };
};

// Method to increment activity
userProgressSchema.methods.incrementActivity = function(activityType, count = 1) {
  if (this.activities[activityType] !== undefined) {
    this.activities[activityType] += count;
    return true;
  }
  return false;
};

// Method to update streak
userProgressSchema.methods.updateLoginStreak = function() {
  const today = new Date();
  const lastLogin = this.streaks.lastLoginDate;
  
  if (!lastLogin) {
    this.streaks.currentLoginStreak = 1;
    this.streaks.lastLoginDate = today;
    return 1;
  }
  
  const daysDiff = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.streaks.currentLoginStreak += 1;
    if (this.streaks.currentLoginStreak > this.streaks.longestLoginStreak) {
      this.streaks.longestLoginStreak = this.streaks.currentLoginStreak;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.streaks.currentLoginStreak = 1;
  }
  // If daysDiff === 0, same day login, no change
  
  this.streaks.lastLoginDate = today;
  return this.streaks.currentLoginStreak;
};

// Static method to get leaderboard
userProgressSchema.statics.getLeaderboard = async function(limit = 10, period = 'all') {
  const match = {};
  
  if (period === 'monthly') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    match.updatedAt = { $gte: startOfMonth };
  }
  
  return this.aggregate([
    { $match: match },
    { $sort: { experiencePoints: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        user: '$userDetails._id',
        username: '$userDetails.username',
        avatar: '$userDetails.avatar',
        experiencePoints: 1,
        level: 1,
        'activities.blogsWritten': 1,
        'activities.reviewsWritten': 1,
        'activities.placesVisited': 1,
        badges: 1,
        rank: { $add: [{ $indexOfArray: ['$$ROOT'] }, 1] }
      }
    }
  ]);
};

// Static method to award achievement
userProgressSchema.statics.awardAchievement = async function(userId, achievementId, progress = 100) {
  const userProgress = await this.findOne({ user: userId });
  if (!userProgress) return null;
  
  const existingAchievement = userProgress.achievements.find(
    a => a.achievementId.toString() === achievementId.toString()
  );
  
  if (!existingAchievement) {
    userProgress.achievements.push({
      achievementId,
      progress,
      unlockedAt: new Date()
    });
    await userProgress.save();
    return true;
  }
  
  return false; // Already has achievement
};

module.exports = mongoose.model('UserProgress', userProgressSchema);