const mongoose = require('mongoose');

// Dark Mode/Theme Preferences Schema
const themePreferencesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
    },
    colorScheme: {
        primary: { type: String, default: '#667eea' },
        secondary: { type: String, default: '#764ba2' },
        accent: { type: String, default: '#f093fb' },
        background: { type: String, default: 'auto' },
        surface: { type: String, default: 'auto' },
        text: { type: String, default: 'auto' }
    },
    customizations: {
        fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
        fontFamily: { type: String, default: 'system' },
        borderRadius: { type: String, enum: ['none', 'small', 'medium', 'large'], default: 'medium' },
        animations: { type: Boolean, default: true },
        reducedMotion: { type: Boolean, default: false },
        highContrast: { type: Boolean, default: false }
    },
    autoSchedule: {
        enabled: { type: Boolean, default: false },
        lightModeStart: { type: String, default: '06:00' },
        darkModeStart: { type: String, default: '18:00' },
        timezone: { type: String, default: 'auto' }
    }
}, {
    timestamps: true
});

// Bookmark System Schema
const bookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['blog', 'place', 'package', 'user', 'collection'],
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'type'
    },
    title: { type: String, required: true },
    description: String,
    image: String,
    url: String,
    tags: [String],
    folder: {
        type: String,
        default: 'default'
    },
    isPrivate: { type: Boolean, default: false },
    metadata: {
        location: String,
        author: String,
        dateVisited: Date,
        rating: Number,
        notes: String,
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
    }
}, {
    timestamps: true
});

// Bookmark Folders Schema
const bookmarkFolderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    description: String,
    color: { type: String, default: '#667eea' },
    icon: { type: String, default: '📂' },
    isPublic: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookmarkFolder'
    }
}, {
    timestamps: true
});

// Enhanced Search Schema
const searchHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: { type: String, required: true },
    type: {
        type: String,
        enum: ['general', 'blogs', 'places', 'packages', 'users'],
        default: 'general'
    },
    filters: {
        dateRange: {
            start: Date,
            end: Date
        },
        location: String,
        categories: [String],
        rating: Number,
        priceRange: {
            min: Number,
            max: Number
        },
        sortBy: String,
        author: String
    },
    results: {
        count: { type: Number, default: 0 },
        topResults: [{
            id: mongoose.Schema.Types.ObjectId,
            type: String,
            title: String,
            score: Number
        }]
    },
    clickedResults: [String], // Track which results were clicked
    sessionId: String
}, {
    timestamps: true
});

// User Reviews and Ratings Schema
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['blog', 'place', 'package', 'user', 'experience'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType'
    },
    rating: {
        overall: { type: Number, min: 1, max: 5, required: true },
        aspects: {
            accuracy: { type: Number, min: 1, max: 5 },
            helpfulness: { type: Number, min: 1, max: 5 },
            writing: { type: Number, min: 1, max: 5 },
            photos: { type: Number, min: 1, max: 5 },
            value: { type: Number, min: 1, max: 5 }
        }
    },
    title: { type: String, maxlength: 100 },
    content: { type: String, maxlength: 2000 },
    pros: [String],
    cons: [String],
    images: [String],
    verified: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    unhelpfulVotes: { type: Number, default: 0 },
    flagCount: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    visitDate: Date,
    tripType: {
        type: String,
        enum: ['solo', 'couple', 'family', 'friends', 'business']
    }
}, {
    timestamps: true
});

// Quick Actions Schema
const quickActionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['create_blog', 'search_places', 'check_weather', 'book_flight', 'save_place', 'share_blog', 'view_stats', 'export_data'],
        required: true
    },
    title: { type: String, required: true },
    description: String,
    icon: { type: String, required: true },
    url: { type: String, required: true },
    shortcut: String, // Keyboard shortcut (e.g., 'Ctrl+N')
    isEnabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    lastUsed: Date
}, {
    timestamps: true
});

// Accessibility Preferences Schema
const accessibilitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    visualPreferences: {
        fontSize: { type: String, enum: ['small', 'medium', 'large', 'extra-large'], default: 'medium' },
        fontWeight: { type: String, enum: ['normal', 'medium', 'bold'], default: 'normal' },
        lineHeight: { type: String, enum: ['normal', 'relaxed', 'loose'], default: 'normal' },
        letterSpacing: { type: String, enum: ['tight', 'normal', 'wide'], default: 'normal' },
        highContrast: { type: Boolean, default: false },
        colorBlindnessSupport: { type: String, enum: ['none', 'deuteranopia', 'protanopia', 'tritanopia'], default: 'none' },
        focusIndicators: { type: Boolean, default: true },
        reducedTransparency: { type: Boolean, default: false }
    },
    motionPreferences: {
        reducedMotion: { type: Boolean, default: false },
        disableAutoplay: { type: Boolean, default: false },
        pauseAnimations: { type: Boolean, default: false },
        reduceParallax: { type: Boolean, default: false }
    },
    navigationPreferences: {
        keyboardNavigation: { type: Boolean, default: true },
        skipLinks: { type: Boolean, default: true },
        breadcrumbs: { type: Boolean, default: true },
        focusManagement: { type: Boolean, default: true }
    },
    screenReaderSupport: {
        announceChanges: { type: Boolean, default: true },
        altTextVerbosity: { type: String, enum: ['minimal', 'detailed', 'verbose'], default: 'detailed' },
        landmarkNavigation: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// User Experience Metrics Schema
const uxMetricsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sessionId: { type: String, required: true },
    page: { type: String, required: true },
    action: { type: String, required: true },
    element: String,
    timestamp: { type: Date, default: Date.now },
    duration: Number, // Time spent on action (ms)
    metadata: {
        screenSize: String,
        deviceType: String,
        browser: String,
        loadTime: Number,
        errorOccurred: Boolean,
        errorMessage: String,
        clickPosition: {
            x: Number,
            y: Number
        },
        scrollDepth: Number,
        exitIntent: Boolean
    }
}, {
    timestamps: true
});

// Notification Preferences Schema
const notificationPreferencesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    email: {
        enabled: { type: Boolean, default: true },
        frequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'daily' },
        types: {
            newFollower: { type: Boolean, default: true },
            newComment: { type: Boolean, default: true },
            blogLiked: { type: Boolean, default: true },
            blogShared: { type: Boolean, default: false },
            weeklyDigest: { type: Boolean, default: true },
            travelReminders: { type: Boolean, default: true },
            promotions: { type: Boolean, default: false }
        }
    },
    push: {
        enabled: { type: Boolean, default: true },
        types: {
            newComment: { type: Boolean, default: true },
            newFollower: { type: Boolean, default: true },
            blogLiked: { type: Boolean, default: false },
            travelAlerts: { type: Boolean, default: true },
            weatherUpdates: { type: Boolean, default: true }
        }
    },
    inApp: {
        enabled: { type: Boolean, default: true },
        showBadge: { type: Boolean, default: true },
        playSound: { type: Boolean, default: false },
        position: { type: String, enum: ['top-right', 'top-left', 'bottom-right', 'bottom-left'], default: 'top-right' }
    },
    quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' },
        timezone: { type: String, default: 'auto' }
    }
}, {
    timestamps: true
});

// Create indexes for performance
themePreferencesSchema.index({ user: 1 });
bookmarkSchema.index({ user: 1, type: 1, folder: 1 });
bookmarkSchema.index({ user: 1, createdAt: -1 });
bookmarkFolderSchema.index({ user: 1, parent: 1 });
searchHistorySchema.index({ user: 1, createdAt: -1 });
searchHistorySchema.index({ query: 'text', type: 1 });
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ 'rating.overall': -1, helpfulVotes: -1 });
quickActionSchema.index({ user: 1, sortOrder: 1 });
accessibilitySchema.index({ user: 1 });
uxMetricsSchema.index({ user: 1, sessionId: 1, timestamp: -1 });
notificationPreferencesSchema.index({ user: 1 });

// Add text search indexes
searchHistorySchema.index({ 
    query: 'text',
    'results.topResults.title': 'text'
});

reviewSchema.index({
    title: 'text',
    content: 'text',
    pros: 'text',
    cons: 'text'
});

module.exports = {
    ThemePreferences: mongoose.model('ThemePreferences', themePreferencesSchema),
    Bookmark: mongoose.model('Bookmark', bookmarkSchema),
    BookmarkFolder: mongoose.model('BookmarkFolder', bookmarkFolderSchema),
    SearchHistory: mongoose.model('SearchHistory', searchHistorySchema),
    QuickAction: mongoose.model('QuickAction', quickActionSchema),
    AccessibilityPreferences: mongoose.model('AccessibilityPreferences', accessibilitySchema),
    UXMetrics: mongoose.model('UXMetrics', uxMetricsSchema),
    NotificationPreferences: mongoose.model('NotificationPreferences', notificationPreferencesSchema)
};