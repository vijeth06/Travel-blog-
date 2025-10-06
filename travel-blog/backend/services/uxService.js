const { 
    ThemePreferences, 
    Bookmark, 
    BookmarkFolder, 
    SearchHistory, 
    Review, 
    QuickAction, 
    AccessibilityPreferences,
    UXMetrics,
    NotificationPreferences 
} = require('../models/UXFeatures');
const Blog = require('../models/Blog');
const User = require('../models/User');

class UXService {
    // Theme Management
    async getUserTheme(userId) {
        try {
            let preferences = await ThemePreferences.findOne({ user: userId });
            
            if (!preferences) {
                preferences = await this.createDefaultTheme(userId);
            }

            return preferences;
        } catch (error) {
            console.error('Get user theme error:', error);
            throw new Error('Failed to get user theme preferences');
        }
    }

    async updateTheme(userId, themeData) {
        try {
            const preferences = await ThemePreferences.findOneAndUpdate(
                { user: userId },
                themeData,
                { upsert: true, new: true }
            );

            return preferences;
        } catch (error) {
            console.error('Update theme error:', error);
            throw new Error('Failed to update theme preferences');
        }
    }

    async createDefaultTheme(userId) {
        try {
            const defaultTheme = new ThemePreferences({
                user: userId,
                theme: 'auto',
                colorScheme: {
                    primary: '#667eea',
                    secondary: '#764ba2',
                    accent: '#f093fb'
                },
                customizations: {
                    fontSize: 'medium',
                    animations: true
                }
            });

            await defaultTheme.save();
            return defaultTheme;
        } catch (error) {
            console.error('Create default theme error:', error);
            throw new Error('Failed to create default theme');
        }
    }

    async generateThemeCSS(preferences) {
        try {
            const theme = preferences.theme;
            const colors = preferences.colorScheme;
            const customizations = preferences.customizations;

            let css = `
                :root {
                    --color-primary: ${colors.primary};
                    --color-secondary: ${colors.secondary};
                    --color-accent: ${colors.accent};
                    --font-size-base: ${this.getFontSizeValue(customizations.fontSize)};
                    --border-radius: ${this.getBorderRadiusValue(customizations.borderRadius)};
                }
            `;

            if (theme === 'dark' || (theme === 'auto' && this.isDarkMode())) {
                css += `
                    :root {
                        --color-background: #1a1a1a;
                        --color-surface: #2d2d2d;
                        --color-text: #ffffff;
                        --color-text-muted: #a0a0a0;
                    }
                `;
            } else {
                css += `
                    :root {
                        --color-background: #ffffff;
                        --color-surface: #f8f9fa;
                        --color-text: #333333;
                        --color-text-muted: #666666;
                    }
                `;
            }

            if (customizations.reducedMotion) {
                css += `
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                `;
            }

            if (customizations.highContrast) {
                css += `
                    :root {
                        --color-text: ${theme === 'dark' ? '#ffffff' : '#000000'};
                        --color-background: ${theme === 'dark' ? '#000000' : '#ffffff'};
                    }
                `;
            }

            return css;
        } catch (error) {
            console.error('Generate theme CSS error:', error);
            throw new Error('Failed to generate theme CSS');
        }
    }

    // Bookmark Management
    async createBookmark(userId, bookmarkData) {
        try {
            const bookmark = new Bookmark({
                user: userId,
                ...bookmarkData
            });

            await bookmark.save();
            await bookmark.populate('itemId');

            return bookmark;
        } catch (error) {
            console.error('Create bookmark error:', error);
            throw new Error('Failed to create bookmark');
        }
    }

    async getUserBookmarks(userId, folder = null, type = null) {
        try {
            const query = { user: userId };
            
            if (folder) query.folder = folder;
            if (type) query.type = type;

            const bookmarks = await Bookmark.find(query)
                .populate('itemId')
                .sort({ createdAt: -1 });

            return bookmarks;
        } catch (error) {
            console.error('Get user bookmarks error:', error);
            throw new Error('Failed to get user bookmarks');
        }
    }

    async createBookmarkFolder(userId, folderData) {
        try {
            const folder = new BookmarkFolder({
                user: userId,
                ...folderData
            });

            await folder.save();
            return folder;
        } catch (error) {
            console.error('Create bookmark folder error:', error);
            throw new Error('Failed to create bookmark folder');
        }
    }

    async getBookmarkFolders(userId) {
        try {
            const folders = await BookmarkFolder.find({ user: userId })
                .sort({ sortOrder: 1, name: 1 });

            // Build folder hierarchy
            const folderMap = new Map();
            const rootFolders = [];

            folders.forEach(folder => {
                folderMap.set(folder._id.toString(), { ...folder.toObject(), children: [] });
            });

            folders.forEach(folder => {
                if (folder.parent) {
                    const parent = folderMap.get(folder.parent.toString());
                    if (parent) {
                        parent.children.push(folderMap.get(folder._id.toString()));
                    }
                } else {
                    rootFolders.push(folderMap.get(folder._id.toString()));
                }
            });

            return rootFolders;
        } catch (error) {
            console.error('Get bookmark folders error:', error);
            throw new Error('Failed to get bookmark folders');
        }
    }

    async moveBookmark(userId, bookmarkId, newFolder) {
        try {
            const bookmark = await Bookmark.findOneAndUpdate(
                { _id: bookmarkId, user: userId },
                { folder: newFolder },
                { new: true }
            );

            if (!bookmark) {
                throw new Error('Bookmark not found');
            }

            return bookmark;
        } catch (error) {
            console.error('Move bookmark error:', error);
            throw new Error('Failed to move bookmark');
        }
    }

    async deleteBookmark(userId, bookmarkId) {
        try {
            const result = await Bookmark.deleteOne({
                _id: bookmarkId,
                user: userId
            });

            if (result.deletedCount === 0) {
                throw new Error('Bookmark not found');
            }

            return { success: true };
        } catch (error) {
            console.error('Delete bookmark error:', error);
            throw new Error('Failed to delete bookmark');
        }
    }

    // Enhanced Search
    async performEnhancedSearch(userId, query, filters = {}, type = 'general') {
        try {
            const searchQuery = {
                $text: { $search: query }
            };

            let results = [];
            let searchTargets = [];

            // Determine search targets based on type
            switch (type) {
                case 'blogs':
                    searchTargets = [Blog];
                    break;
                case 'users':
                    searchTargets = [User];
                    break;
                case 'general':
                default:
                    searchTargets = [Blog, User];
                    break;
            }

            // Apply filters
            if (filters.dateRange) {
                searchQuery.createdAt = {
                    $gte: new Date(filters.dateRange.start),
                    $lte: new Date(filters.dateRange.end)
                };
            }

            if (filters.location) {
                searchQuery.location = new RegExp(filters.location, 'i');
            }

            if (filters.categories && filters.categories.length > 0) {
                searchQuery.categories = { $in: filters.categories };
            }

            if (filters.author) {
                searchQuery.author = filters.author;
            }

            // Search across different models
            const searchPromises = searchTargets.map(async (Model) => {
                try {
                    const modelResults = await Model.find(searchQuery)
                        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
                        .limit(20)
                        .populate('author', 'name avatar');

                    return modelResults.map(result => ({
                        ...result.toObject(),
                        type: Model.modelName.toLowerCase(),
                        score: result.score || 1
                    }));
                } catch (error) {
                    console.error(`Search error for ${Model.modelName}:`, error);
                    return [];
                }
            });

            const searchResults = await Promise.all(searchPromises);
            results = searchResults.flat();

            // Sort by relevance score
            results.sort((a, b) => (b.score || 0) - (a.score || 0));

            // Apply additional filters
            if (filters.sortBy) {
                results = this.applySorting(results, filters.sortBy);
            }

            // Save search history
            const searchHistory = new SearchHistory({
                user: userId,
                query,
                type,
                filters,
                results: {
                    count: results.length,
                    topResults: results.slice(0, 5).map(r => ({
                        id: r._id,
                        type: r.type,
                        title: r.title || r.name,
                        score: r.score
                    }))
                },
                sessionId: this.generateSessionId()
            });

            await searchHistory.save();

            return {
                results: results.slice(0, 50), // Limit to 50 results
                totalCount: results.length,
                filters: filters,
                suggestions: await this.getSearchSuggestions(query, type)
            };
        } catch (error) {
            console.error('Enhanced search error:', error);
            throw new Error('Failed to perform enhanced search');
        }
    }

    async getSearchSuggestions(query, type) {
        try {
            // Get popular searches
            const popularSearches = await SearchHistory.aggregate([
                { $match: { type, query: new RegExp(query, 'i') } },
                { $group: { _id: '$query', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            // Get related terms (simplified)
            const relatedTerms = await this.getRelatedSearchTerms(query, type);

            return {
                popular: popularSearches.map(s => s._id),
                related: relatedTerms
            };
        } catch (error) {
            console.error('Get search suggestions error:', error);
            return { popular: [], related: [] };
        }
    }

    async getSearchHistory(userId, limit = 10) {
        try {
            const history = await SearchHistory.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(limit);

            return history;
        } catch (error) {
            console.error('Get search history error:', error);
            throw new Error('Failed to get search history');
        }
    }

    // Review System
    async createReview(userId, reviewData) {
        try {
            // Check if user already reviewed this item
            const existingReview = await Review.findOne({
                user: userId,
                targetType: reviewData.targetType,
                targetId: reviewData.targetId
            });

            if (existingReview) {
                throw new Error('You have already reviewed this item');
            }

            const review = new Review({
                user: userId,
                ...reviewData
            });

            await review.save();
            await review.populate('user', 'name avatar');

            // Update target item's average rating
            await this.updateAverageRating(reviewData.targetType, reviewData.targetId);

            return review;
        } catch (error) {
            console.error('Create review error:', error);
            throw new Error('Failed to create review');
        }
    }

    async getReviews(targetType, targetId, page = 1, limit = 10, sortBy = 'helpful') {
        try {
            const skip = (page - 1) * limit;
            let sortQuery = {};

            switch (sortBy) {
                case 'helpful':
                    sortQuery = { helpfulVotes: -1, createdAt: -1 };
                    break;
                case 'recent':
                    sortQuery = { createdAt: -1 };
                    break;
                case 'rating':
                    sortQuery = { 'rating.overall': -1, createdAt: -1 };
                    break;
                default:
                    sortQuery = { createdAt: -1 };
            }

            const reviews = await Review.find({
                targetType,
                targetId,
                isVisible: true
            })
                .populate('user', 'name avatar')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit);

            const totalReviews = await Review.countDocuments({
                targetType,
                targetId,
                isVisible: true
            });

            // Get rating distribution
            const ratingDistribution = await Review.aggregate([
                { $match: { targetType, targetId, isVisible: true } },
                { $group: { _id: '$rating.overall', count: { $sum: 1 } } },
                { $sort: { _id: -1 } }
            ]);

            const avgRating = await Review.aggregate([
                { $match: { targetType, targetId, isVisible: true } },
                { $group: { _id: null, avgRating: { $avg: '$rating.overall' } } }
            ]);

            return {
                reviews,
                totalReviews,
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                averageRating: avgRating[0]?.avgRating || 0,
                ratingDistribution: ratingDistribution.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {})
            };
        } catch (error) {
            console.error('Get reviews error:', error);
            throw new Error('Failed to get reviews');
        }
    }

    async voteOnReview(userId, reviewId, isHelpful) {
        try {
            const review = await Review.findById(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }

            // Check if user already voted (implement UserVote model if needed)
            // For now, just update the vote counts
            if (isHelpful) {
                review.helpfulVotes += 1;
            } else {
                review.unhelpfulVotes += 1;
            }

            await review.save();
            return review;
        } catch (error) {
            console.error('Vote on review error:', error);
            throw new Error('Failed to vote on review');
        }
    }

    // Quick Actions
    async getQuickActions(userId) {
        try {
            let actions = await QuickAction.find({ user: userId })
                .sort({ sortOrder: 1, usageCount: -1 });

            if (actions.length === 0) {
                actions = await this.createDefaultQuickActions(userId);
            }

            return actions;
        } catch (error) {
            console.error('Get quick actions error:', error);
            throw new Error('Failed to get quick actions');
        }
    }

    async createDefaultQuickActions(userId) {
        try {
            const defaultActions = [
                {
                    action: 'create_blog',
                    title: 'New Blog Post',
                    description: 'Write about your latest adventure',
                    icon: '✍️',
                    url: '/create-blog',
                    shortcut: 'Ctrl+N',
                    sortOrder: 1
                },
                {
                    action: 'search_places',
                    title: 'Discover Places',
                    description: 'Find your next destination',
                    icon: '🌍',
                    url: '/discover',
                    shortcut: 'Ctrl+F',
                    sortOrder: 2
                },
                {
                    action: 'check_weather',
                    title: 'Check Weather',
                    description: 'Weather for your destinations',
                    icon: '🌤️',
                    url: '/weather',
                    sortOrder: 3
                },
                {
                    action: 'view_stats',
                    title: 'My Statistics',
                    description: 'View your travel insights',
                    icon: '📊',
                    url: '/dashboard/stats',
                    sortOrder: 4
                }
            ];

            const actions = await QuickAction.insertMany(
                defaultActions.map(action => ({ ...action, user: userId }))
            );

            return actions;
        } catch (error) {
            console.error('Create default quick actions error:', error);
            throw new Error('Failed to create default quick actions');
        }
    }

    async updateQuickActions(userId, actions) {
        try {
            // Delete existing actions
            await QuickAction.deleteMany({ user: userId });

            // Create new actions
            const newActions = await QuickAction.insertMany(
                actions.map(action => ({ ...action, user: userId }))
            );

            return newActions;
        } catch (error) {
            console.error('Update quick actions error:', error);
            throw new Error('Failed to update quick actions');
        }
    }

    async recordQuickActionUsage(userId, actionId) {
        try {
            await QuickAction.findOneAndUpdate(
                { _id: actionId, user: userId },
                { 
                    $inc: { usageCount: 1 },
                    lastUsed: new Date()
                }
            );
        } catch (error) {
            console.error('Record quick action usage error:', error);
        }
    }

    // Accessibility
    async getAccessibilityPreferences(userId) {
        try {
            let preferences = await AccessibilityPreferences.findOne({ user: userId });
            
            if (!preferences) {
                preferences = await this.createDefaultAccessibilityPreferences(userId);
            }

            return preferences;
        } catch (error) {
            console.error('Get accessibility preferences error:', error);
            throw new Error('Failed to get accessibility preferences');
        }
    }

    async updateAccessibilityPreferences(userId, preferences) {
        try {
            const updated = await AccessibilityPreferences.findOneAndUpdate(
                { user: userId },
                preferences,
                { upsert: true, new: true }
            );

            return updated;
        } catch (error) {
            console.error('Update accessibility preferences error:', error);
            throw new Error('Failed to update accessibility preferences');
        }
    }

    async createDefaultAccessibilityPreferences(userId) {
        try {
            const defaultPreferences = new AccessibilityPreferences({
                user: userId,
                visualPreferences: {
                    fontSize: 'medium',
                    fontWeight: 'normal',
                    highContrast: false
                },
                motionPreferences: {
                    reducedMotion: false,
                    disableAutoplay: false
                },
                navigationPreferences: {
                    keyboardNavigation: true,
                    skipLinks: true
                }
            });

            await defaultPreferences.save();
            return defaultPreferences;
        } catch (error) {
            console.error('Create default accessibility preferences error:', error);
            throw new Error('Failed to create default accessibility preferences');
        }
    }

    // UX Metrics
    async recordUXMetric(userId, metricData) {
        try {
            const metric = new UXMetrics({
                user: userId,
                ...metricData
            });

            await metric.save();
            return metric;
        } catch (error) {
            console.error('Record UX metric error:', error);
            // Don't throw error for analytics - fail silently
        }
    }

    async getUXInsights(userId, timeRange = '30d') {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(timeRange));

            const metrics = await UXMetrics.aggregate([
                { 
                    $match: { 
                        user: userId ? mongoose.Types.ObjectId(userId) : { $exists: true },
                        timestamp: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$page',
                        avgDuration: { $avg: '$duration' },
                        totalActions: { $sum: 1 },
                        errorCount: { $sum: { $cond: ['$metadata.errorOccurred', 1, 0] } },
                        avgLoadTime: { $avg: '$metadata.loadTime' },
                        avgScrollDepth: { $avg: '$metadata.scrollDepth' }
                    }
                },
                { $sort: { totalActions: -1 } }
            ]);

            return {
                pageMetrics: metrics,
                timeRange,
                totalUsers: userId ? 1 : await UXMetrics.distinct('user').count(),
                summary: {
                    totalPageViews: metrics.reduce((sum, m) => sum + m.totalActions, 0),
                    avgSessionDuration: metrics.reduce((sum, m) => sum + m.avgDuration, 0) / metrics.length,
                    errorRate: (metrics.reduce((sum, m) => sum + m.errorCount, 0) / 
                              metrics.reduce((sum, m) => sum + m.totalActions, 0)) * 100
                }
            };
        } catch (error) {
            console.error('Get UX insights error:', error);
            throw new Error('Failed to get UX insights');
        }
    }

    // Utility Methods
    getFontSizeValue(size) {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px',
            'extra-large': '20px'
        };
        return sizes[size] || sizes.medium;
    }

    getBorderRadiusValue(radius) {
        const radii = {
            none: '0px',
            small: '4px',
            medium: '8px',
            large: '12px'
        };
        return radii[radius] || radii.medium;
    }

    isDarkMode() {
        // In a real implementation, this would check system preferences
        // For now, return false (light mode default)
        return false;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    applySorting(results, sortBy) {
        switch (sortBy) {
            case 'date':
                return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'popularity':
                return results.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            case 'rating':
                return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default:
                return results;
        }
    }

    async updateAverageRating(targetType, targetId) {
        try {
            const avgRating = await Review.aggregate([
                { $match: { targetType, targetId, isVisible: true } },
                { $group: { _id: null, avgRating: { $avg: '$rating.overall' } } }
            ]);

            if (avgRating.length > 0) {
                // Update the target item's rating (implement based on your models)
                const Model = this.getModelByType(targetType);
                if (Model) {
                    await Model.findByIdAndUpdate(targetId, {
                        averageRating: avgRating[0].avgRating
                    });
                }
            }
        } catch (error) {
            console.error('Update average rating error:', error);
        }
    }

    getModelByType(type) {
        switch (type) {
            case 'blog':
                return Blog;
            case 'user':
                return User;
            default:
                return null;
        }
    }

    async getRelatedSearchTerms(query, type) {
        // Simplified implementation - in production, use NLP or ML
        const commonTerms = {
            general: ['travel', 'trip', 'vacation', 'adventure', 'destination'],
            blogs: ['travel blog', 'journey', 'experience', 'guide', 'tips'],
            places: ['destination', 'location', 'city', 'country', 'attraction'],
            users: ['traveler', 'blogger', 'guide', 'expert']
        };

        return commonTerms[type] || commonTerms.general;
    }
}

module.exports = new UXService();