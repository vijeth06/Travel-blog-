const mongoose = require('mongoose');

// Real-time Collaboration Schema
const collaborationSessionSchema = new mongoose.Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['editor', 'commenter', 'viewer'],
            default: 'viewer'
        },
        joinedAt: { type: Date, default: Date.now },
        lastActive: { type: Date, default: Date.now },
        isOnline: { type: Boolean, default: false },
        cursor: {
            position: Number,
            selection: {
                start: Number,
                end: Number
            }
        }
    }],
    sessionId: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },
    settings: {
        maxCollaborators: { type: Number, default: 10 },
        allowAnonymous: { type: Boolean, default: false },
        requireApproval: { type: Boolean, default: true },
        autoSave: { type: Boolean, default: true },
        showCursors: { type: Boolean, default: true },
        allowComments: { type: Boolean, default: true }
    },
    document: {
        content: String,
        version: { type: Number, default: 1 },
        lastModified: { type: Date, default: Date.now },
        operations: [{
            type: { type: String, enum: ['insert', 'delete', 'format'] },
            position: Number,
            content: String,
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now }
        }]
    }
}, {
    timestamps: true
});

// Emergency Assistance Schema
const emergencyContactSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['personal', 'embassy', 'insurance', 'medical', 'local_emergency'],
        required: true
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: String,
    country: String,
    relationship: String, // for personal contacts
    specialInstructions: String,
    isVerified: { type: Boolean, default: false },
    isPrimary: { type: Boolean, default: false }
}, {
    timestamps: true
});

const emergencyAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['medical', 'safety', 'natural_disaster', 'political', 'transportation', 'theft', 'other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        address: String,
        city: String,
        country: String
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'escalated', 'cancelled'],
        default: 'active'
    },
    responses: [{
        responder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        responderType: {
            type: String,
            enum: ['friend', 'family', 'emergency_service', 'embassy', 'local_authority', 'travel_insurance']
        },
        message: String,
        action: String,
        timestamp: { type: Date, default: Date.now }
    }],
    notifiedContacts: [String], // Phone numbers or email addresses
    isResolved: { type: Boolean, default: false },
    resolvedAt: Date,
    metadata: {
        deviceInfo: String,
        batteryLevel: Number,
        networkType: String,
        lastKnownLocation: {
            lat: Number,
            lng: Number,
            timestamp: Date
        }
    }
}, {
    timestamps: true
});

// Blockchain Certificate Schema
const blockchainCertificateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['trip_completion', 'milestone_achievement', 'travel_expert', 'community_contribution', 'safety_training'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    criteria: [{
        requirement: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
        proof: String
    }],
    blockchain: {
        network: { type: String, enum: ['ethereum', 'polygon', 'binance'], default: 'polygon' },
        contractAddress: String,
        tokenId: String,
        transactionHash: String,
        blockNumber: Number,
        gasUsed: Number,
        mintedAt: Date
    },
    metadata: {
        image: String,
        attributes: [{
            trait_type: String,
            value: String,
            display_type: String
        }],
        external_url: String,
        animation_url: String,
        background_color: String
    },
    verification: {
        isVerified: { type: Boolean, default: false },
        verifiedBy: String,
        verificationDate: Date,
        verificationProof: String
    },
    stats: {
        viewCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 }
    },
    isPublic: { type: Boolean, default: true },
    isMinted: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Advanced AI Recommendations Schema
const aiRecommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['destination', 'activity', 'restaurant', 'accommodation', 'route', 'timing', 'budget', 'safety'],
        required: true
    },
    category: {
        type: String,
        enum: ['personal', 'trending', 'seasonal', 'weather_based', 'budget_optimized', 'time_optimized', 'safety_prioritized'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, required: true },
    reasoning: [String], // Why this recommendation was made
    data: {
        itemId: mongoose.Schema.Types.ObjectId,
        itemType: String,
        location: {
            coordinates: {
                lat: Number,
                lng: Number
            },
            city: String,
            country: String
        },
        priceRange: {
            min: Number,
            max: Number,
            currency: String
        },
        timeframe: {
            start: Date,
            end: Date,
            duration: Number // in days
        },
        tags: [String],
        rating: Number,
        reviewCount: Number
    },
    personalizedFactors: {
        userPreferences: [String],
        travelHistory: [String],
        budgetRange: String,
        travelStyle: String,
        groupType: String,
        seasonalPreferences: [String]
    },
    mlModel: {
        modelVersion: String,
        algorithm: String,
        features: [String],
        trainingData: String
    },
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        wasHelpful: Boolean,
        wasUsed: Boolean,
        userComment: String,
        feedbackDate: Date
    },
    status: {
        type: String,
        enum: ['pending', 'viewed', 'saved', 'used', 'dismissed'],
        default: 'pending'
    },
    expiresAt: Date
}, {
    timestamps: true
});

// Live Trip Updates Schema
const liveTripUpdateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog' // Assuming trip is associated with a blog
    },
    type: {
        type: String,
        enum: ['location', 'activity', 'photo', 'video', 'status', 'safety_checkin', 'milestone'],
        required: true
    },
    content: {
        text: String,
        media: [String], // URLs to photos/videos
        location: {
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true }
            },
            address: String,
            city: String,
            country: String,
            placeName: String
        },
        activity: String,
        mood: { type: String, enum: ['excited', 'happy', 'relaxed', 'adventurous', 'tired', 'amazed'] },
        weather: {
            condition: String,
            temperature: Number,
            icon: String
        }
    },
    privacy: {
        type: String,
        enum: ['public', 'friends', 'family', 'private'],
        default: 'friends'
    },
    engagement: {
        likes: { type: Number, default: 0 },
        comments: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            timestamp: { type: Date, default: Date.now }
        }],
        shares: { type: Number, default: 0 }
    },
    metadata: {
        deviceType: String,
        batteryLevel: Number,
        networkType: String,
        timestamp: { type: Date, default: Date.now },
        isAutomated: { type: Boolean, default: false }
    },
    followers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notificationPreference: {
            type: String,
            enum: ['all', 'important', 'none'],
            default: 'all'
        }
    }]
}, {
    timestamps: true
});

// Community Features Schema
const communityGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['destination', 'activity', 'travel_style', 'budget', 'age_group', 'interest'],
        required: true
    },
    category: String, // e.g., "Backpacking", "Luxury Travel", "Family Travel"
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['member', 'contributor', 'moderator'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true }
    }],
    settings: {
        isPublic: { type: Boolean, default: true },
        requireApproval: { type: Boolean, default: false },
        allowInvites: { type: Boolean, default: true },
        maxMembers: { type: Number, default: 10000 }
    },
    stats: {
        memberCount: { type: Number, default: 0 },
        postCount: { type: Number, default: 0 },
        activityScore: { type: Number, default: 0 },
        weeklyActiveUsers: { type: Number, default: 0 }
    },
    tags: [String],
    avatar: String,
    banner: String,
    location: {
        coordinates: {
            lat: Number,
            lng: Number
        },
        city: String,
        country: String,
        region: String
    }
}, {
    timestamps: true
});

const communityPostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityGroup'
    },
    type: {
        type: String,
        enum: ['discussion', 'question', 'tip', 'photo', 'video', 'review', 'meetup', 'help'],
        required: true
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    media: [String],
    tags: [String],
    location: {
        coordinates: {
            lat: Number,
            lng: Number
        },
        city: String,
        country: String,
        placeName: String
    },
    engagement: {
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        saves: { type: Number, default: 0 },
        views: { type: Number, default: 0 }
    },
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        likes: { type: Number, default: 0 },
        replies: [{
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: String,
            timestamp: { type: Date, default: Date.now }
        }],
        timestamp: { type: Date, default: Date.now }
    }],
    isHelpful: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['active', 'hidden', 'deleted', 'reported'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Gamification Schema
const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['travel', 'social', 'content', 'exploration', 'community', 'safety', 'learning'],
        required: true
    },
    type: {
        type: String,
        enum: ['milestone', 'badge', 'streak', 'challenge', 'rare'],
        required: true
    },
    criteria: {
        metric: String, // e.g., 'countries_visited', 'blogs_written', 'days_traveled'
        threshold: Number,
        conditions: [String], // Additional conditions
        timeframe: Number // Days to complete (for challenges)
    },
    rewards: {
        points: { type: Number, default: 0 },
        badge: String,
        title: String,
        perks: [String] // Special privileges
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    icon: String,
    color: String,
    isActive: { type: Boolean, default: true },
    stats: {
        totalEarned: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

const userAchievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    achievement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
        required: true
    },
    progress: {
        current: { type: Number, default: 0 },
        target: { type: Number, required: true },
        percentage: { type: Number, default: 0 }
    },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    evidence: [String], // Links to blogs, photos, etc. that prove achievement
    isVisible: { type: Boolean, default: true },
    notified: { type: Boolean, default: false }
}, {
    timestamps: true
});

const gamificationStatsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    level: { type: Number, default: 1 },
    totalPoints: { type: Number, default: 0 },
    currentStreaks: {
        dailyCheckin: { type: Number, default: 0 },
        weeklyBlog: { type: Number, default: 0 },
        monthlyTravel: { type: Number, default: 0 }
    },
    longestStreaks: {
        dailyCheckin: { type: Number, default: 0 },
        weeklyBlog: { type: Number, default: 0 },
        monthlyTravel: { type: Number, default: 0 }
    },
    categories: {
        explorer: { type: Number, default: 0 }, // Points from visiting new places
        storyteller: { type: Number, default: 0 }, // Points from writing blogs
        connector: { type: Number, default: 0 }, // Points from community engagement
        adventurer: { type: Number, default: 0 }, // Points from trying new activities
        helper: { type: Number, default: 0 }, // Points from helping others
        safety: { type: Number, default: 0 } // Points from safety practices
    },
    rankings: {
        global: { type: Number, default: 0 },
        country: { type: Number, default: 0 },
        friends: { type: Number, default: 0 }
    },
    lastActivity: Date,
    seasonalChallenges: [{
        challengeId: String,
        progress: Number,
        completed: Boolean,
        completedAt: Date
    }]
}, {
    timestamps: true
});

// Create indexes for performance
collaborationSessionSchema.index({ blog: 1, isActive: 1 });
collaborationSessionSchema.index({ 'collaborators.user': 1 });
emergencyContactSchema.index({ user: 1, type: 1 });
emergencyAlertSchema.index({ user: 1, status: 1 });
emergencyAlertSchema.index({ 'location.coordinates': '2dsphere' });
blockchainCertificateSchema.index({ user: 1, type: 1 });
blockchainCertificateSchema.index({ 'blockchain.transactionHash': 1 });
aiRecommendationSchema.index({ user: 1, type: 1, status: 1 });
aiRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
liveTripUpdateSchema.index({ user: 1, createdAt: -1 });
liveTripUpdateSchema.index({ 'content.location.coordinates': '2dsphere' });
communityGroupSchema.index({ type: 1, category: 1 });
communityGroupSchema.index({ 'location.coordinates': '2dsphere' });
communityPostSchema.index({ group: 1, createdAt: -1 });
communityPostSchema.index({ author: 1, type: 1 });
achievementSchema.index({ category: 1, type: 1 });
userAchievementSchema.index({ user: 1, achievement: 1 });
gamificationStatsSchema.index({ user: 1 });
gamificationStatsSchema.index({ totalPoints: -1 });

module.exports = {
    CollaborationSession: mongoose.model('CollaborationSession', collaborationSessionSchema),
    EmergencyContact: mongoose.model('EmergencyContact', emergencyContactSchema),
    EmergencyAlert: mongoose.model('EmergencyAlert', emergencyAlertSchema),
    BlockchainCertificate: mongoose.model('BlockchainCertificate', blockchainCertificateSchema),
    AIRecommendation: mongoose.model('AIRecommendation', aiRecommendationSchema),
    LiveTripUpdate: mongoose.model('LiveTripUpdate', liveTripUpdateSchema),
    CommunityGroup: mongoose.model('CommunityGroup', communityGroupSchema),
    CommunityPost: mongoose.model('CommunityPost', communityPostSchema),
    // Achievement: mongoose.model('Achievement', achievementSchema), // Moved to separate file
    HighImpactUserAchievement: mongoose.model('HighImpactUserAchievement', userAchievementSchema),
    GamificationStats: mongoose.model('GamificationStats', gamificationStatsSchema)
};