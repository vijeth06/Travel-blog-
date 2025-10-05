const {
    CollaborationSession,
    EmergencyContact,
    EmergencyAlert,
    BlockchainCertificate,
    AIRecommendation,
    LiveTripUpdate,
    CommunityGroup,
    CommunityPost,
    Achievement,
    HighImpactUserAchievement,
    GamificationStats
} = require('../models/HighImpactFeatures');
const Blog = require('../models/Blog');
const User = require('../models/User');
const crypto = require('crypto');
const axios = require('axios');

class HighImpactService {
    // Real-time Collaboration Services
    async createCollaborationSession(hostUserId, blogId, settings = {}) {
        try {
            const sessionId = crypto.randomUUID();
            const session = new CollaborationSession({
                blog: blogId,
                host: hostUserId,
                sessionId,
                settings: {
                    maxCollaborators: settings.maxCollaborators || 10,
                    allowAnonymous: settings.allowAnonymous || false,
                    requireApproval: settings.requireApproval || true,
                    autoSave: settings.autoSave || true,
                    showCursors: settings.showCursors || true,
                    allowComments: settings.allowComments || true
                }
            });

            // Initialize document with blog content
            const blog = await Blog.findById(blogId);
            if (blog) {
                session.document = {
                    content: blog.content || '',
                    version: 1
                };
            }

            await session.save();
            return session;
        } catch (error) {
            throw new Error(`Failed to create collaboration session: ${error.message}`);
        }
    }

    async joinCollaborationSession(sessionId, userId, role = 'viewer') {
        try {
            const session = await CollaborationSession.findOne({ sessionId, isActive: true });
            if (!session) {
                throw new Error('Collaboration session not found');
            }

            // Check if user is already a collaborator
            const existingCollaborator = session.collaborators.find(
                collab => collab.user.toString() === userId
            );

            if (existingCollaborator) {
                existingCollaborator.isOnline = true;
                existingCollaborator.lastActive = new Date();
            } else {
                if (session.collaborators.length >= session.settings.maxCollaborators) {
                    throw new Error('Maximum collaborators reached');
                }

                session.collaborators.push({
                    user: userId,
                    role,
                    isOnline: true
                });
            }

            await session.save();
            return session.populate('collaborators.user', 'username avatar');
        } catch (error) {
            throw new Error(`Failed to join collaboration session: ${error.message}`);
        }
    }

    async updateDocument(sessionId, operation, userId) {
        try {
            const session = await CollaborationSession.findOne({ sessionId, isActive: true });
            if (!session) {
                throw new Error('Collaboration session not found');
            }

            // Verify user has edit permissions
            const collaborator = session.collaborators.find(
                collab => collab.user.toString() === userId
            );

            if (!collaborator || collaborator.role === 'viewer') {
                throw new Error('Insufficient permissions to edit document');
            }

            // Apply operation to document
            if (operation.type === 'insert') {
                const content = session.document.content;
                session.document.content = 
                    content.slice(0, operation.position) + 
                    operation.content + 
                    content.slice(operation.position);
            } else if (operation.type === 'delete') {
                const content = session.document.content;
                session.document.content = 
                    content.slice(0, operation.position) + 
                    content.slice(operation.position + operation.length);
            }

            // Record operation
            session.document.operations.push({
                type: operation.type,
                position: operation.position,
                content: operation.content,
                author: userId
            });

            session.document.version += 1;
            session.document.lastModified = new Date();

            // Auto-save to blog if enabled
            if (session.settings.autoSave) {
                await Blog.findByIdAndUpdate(session.blog, {
                    content: session.document.content
                });
            }

            await session.save();
            return session.document;
        } catch (error) {
            throw new Error(`Failed to update document: ${error.message}`);
        }
    }

    // Emergency Assistance Services
    async addEmergencyContact(userId, contactData) {
        try {
            const contact = new EmergencyContact({
                user: userId,
                ...contactData
            });

            // If this is set as primary, unset other primary contacts of same type
            if (contactData.isPrimary) {
                await EmergencyContact.updateMany(
                    { user: userId, type: contactData.type },
                    { isPrimary: false }
                );
            }

            await contact.save();
            return contact;
        } catch (error) {
            throw new Error(`Failed to add emergency contact: ${error.message}`);
        }
    }

    async createEmergencyAlert(userId, alertData) {
        try {
            const alert = new EmergencyAlert({
                user: userId,
                ...alertData
            });

            await alert.save();

            // Get emergency contacts
            const contacts = await EmergencyContact.find({ user: userId });
            
            // Send notifications to emergency contacts
            for (const contact of contacts) {
                await this.sendEmergencyNotification(alert, contact);
            }

            return alert;
        } catch (error) {
            throw new Error(`Failed to create emergency alert: ${error.message}`);
        }
    }

    async sendEmergencyNotification(alert, contact) {
        try {
            const user = await User.findById(alert.user);
            const message = `EMERGENCY ALERT: ${user.username} needs assistance. ${alert.description}. Location: ${alert.location.address || 'Unknown'}. Contact authorities if unable to reach directly.`;

            // In a real implementation, integrate with SMS/email services
            console.log(`Emergency notification sent to ${contact.name} (${contact.phone}): ${message}`);
            
            alert.notifiedContacts.push(contact.phone);
            await alert.save();
        } catch (error) {
            console.error('Failed to send emergency notification:', error);
        }
    }

    // Blockchain Certificate Services
    async createCertificate(userId, certificateData) {
        try {
            const certificate = new BlockchainCertificate({
                user: userId,
                ...certificateData,
                metadata: {
                    image: certificateData.image || `https://api.travel-certificates.com/generate/${certificateData.type}`,
                    attributes: this.generateCertificateAttributes(certificateData),
                    external_url: `https://travel-blog.com/certificates/${certificateData.type}`,
                    ...certificateData.metadata
                }
            });

            await certificate.save();
            return certificate;
        } catch (error) {
            throw new Error(`Failed to create certificate: ${error.message}`);
        }
    }

    async mintCertificateToBlockchain(certificateId) {
        try {
            const certificate = await BlockchainCertificate.findById(certificateId);
            if (!certificate) {
                throw new Error('Certificate not found');
            }

            // Simulate blockchain minting (integrate with actual blockchain service)
            const mockTransactionHash = crypto.randomBytes(32).toString('hex');
            const mockTokenId = crypto.randomInt(1000000, 9999999).toString();

            certificate.blockchain = {
                network: 'polygon',
                contractAddress: '0x1234567890123456789012345678901234567890',
                tokenId: mockTokenId,
                transactionHash: mockTransactionHash,
                blockNumber: Math.floor(Math.random() * 1000000),
                gasUsed: Math.floor(Math.random() * 100000),
                mintedAt: new Date()
            };

            certificate.isMinted = true;
            await certificate.save();

            return certificate;
        } catch (error) {
            throw new Error(`Failed to mint certificate: ${error.message}`);
        }
    }

    generateCertificateAttributes(certificateData) {
        const attributes = [
            { trait_type: "Type", value: certificateData.type },
            { trait_type: "Rarity", value: this.calculateCertificateRarity(certificateData) },
            { trait_type: "Issue Date", value: new Date().toISOString().split('T')[0] }
        ];

        if (certificateData.location) {
            attributes.push({ trait_type: "Location", value: certificateData.location });
        }

        return attributes;
    }

    calculateCertificateRarity(certificateData) {
        // Simple rarity calculation based on type and criteria
        const rarityMap = {
            'trip_completion': 'Common',
            'milestone_achievement': 'Uncommon',
            'travel_expert': 'Rare',
            'community_contribution': 'Epic',
            'safety_training': 'Legendary'
        };
        return rarityMap[certificateData.type] || 'Common';
    }

    // AI Recommendation Services
    async generatePersonalizedRecommendations(userId, preferences = {}) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Get user's travel history and preferences
            const userBlogs = await Blog.find({ author: userId }).sort({ createdAt: -1 }).limit(10);
            
            const recommendations = [];

            // Generate destination recommendations
            const destinationRecs = await this.generateDestinationRecommendations(user, userBlogs, preferences);
            recommendations.push(...destinationRecs);

            // Generate activity recommendations
            const activityRecs = await this.generateActivityRecommendations(user, userBlogs, preferences);
            recommendations.push(...activityRecs);

            // Generate timing recommendations
            const timingRecs = await this.generateTimingRecommendations(user, preferences);
            recommendations.push(...timingRecs);

            // Save recommendations
            for (const rec of recommendations) {
                const aiRec = new AIRecommendation({
                    user: userId,
                    ...rec,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                });
                await aiRec.save();
            }

            return recommendations;
        } catch (error) {
            throw new Error(`Failed to generate recommendations: ${error.message}`);
        }
    }

    async generateDestinationRecommendations(user, userBlogs, preferences) {
        // Analyze user's travel patterns
        const visitedCountries = [...new Set(userBlogs.map(blog => blog.location?.country).filter(Boolean))];
        const preferredRegions = this.analyzePreferredRegions(userBlogs);
        
        const recommendations = [
            {
                type: 'destination',
                category: 'personal',
                title: 'Hidden Gems in Southeast Asia',
                description: 'Based on your love for cultural experiences and adventure activities',
                confidence: 0.85,
                reasoning: ['Similar climate preferences', 'Adventure activity interest', 'Cultural exploration history'],
                data: {
                    location: { city: 'Luang Prabang', country: 'Laos' },
                    priceRange: { min: 50, max: 150, currency: 'USD' },
                    tags: ['culture', 'adventure', 'budget-friendly'],
                    rating: 4.6
                },
                personalizedFactors: {
                    userPreferences: user.preferences?.interests || [],
                    travelHistory: visitedCountries,
                    budgetRange: preferences.budget || 'medium',
                    travelStyle: user.preferences?.travelStyle || 'adventure'
                }
            }
        ];

        return recommendations;
    }

    async generateActivityRecommendations(user, userBlogs, preferences) {
        const recommendations = [
            {
                type: 'activity',
                category: 'trending',
                title: 'Sustainable Hiking Experiences',
                description: 'Eco-friendly hiking trails that match your fitness level and environmental values',
                confidence: 0.78,
                reasoning: ['Outdoor activity preference', 'Sustainability interest', 'Fitness level match'],
                data: {
                    priceRange: { min: 0, max: 50, currency: 'USD' },
                    tags: ['hiking', 'eco-friendly', 'nature'],
                    rating: 4.8
                }
            }
        ];

        return recommendations;
    }

    async generateTimingRecommendations(user, preferences) {
        const recommendations = [
            {
                type: 'timing',
                category: 'weather_based',
                title: 'Best Time to Visit Japan',
                description: 'Optimal weather conditions for your planned Japan trip based on your activity preferences',
                confidence: 0.92,
                reasoning: ['Weather preferences', 'Activity schedule', 'Crowd avoidance'],
                data: {
                    timeframe: {
                        start: new Date('2024-04-01'),
                        end: new Date('2024-05-15'),
                        duration: 14
                    },
                    tags: ['cherry-blossom', 'mild-weather', 'cultural-events']
                }
            }
        ];

        return recommendations;
    }

    analyzePreferredRegions(blogs) {
        const regions = {};
        blogs.forEach(blog => {
            if (blog.location?.region) {
                regions[blog.location.region] = (regions[blog.location.region] || 0) + 1;
            }
        });
        return Object.keys(regions).sort((a, b) => regions[b] - regions[a]);
    }

    // Live Trip Update Services
    async createLiveTripUpdate(userId, updateData) {
        try {
            const update = new LiveTripUpdate({
                user: userId,
                ...updateData
            });

            await update.save();

            // Notify followers
            await this.notifyTripFollowers(update);

            return update.populate('user', 'username avatar');
        } catch (error) {
            throw new Error(`Failed to create live trip update: ${error.message}`);
        }
    }

    async notifyTripFollowers(update) {
        try {
            const followers = update.followers.filter(
                follower => follower.notificationPreference !== 'none'
            );

            for (const follower of followers) {
                // Send notification (integrate with push notification service)
                console.log(`Notifying follower ${follower.user} about trip update`);
            }
        } catch (error) {
            console.error('Failed to notify trip followers:', error);
        }
    }

    async followTrip(tripUserId, followerId, notificationPreference = 'all') {
        try {
            await LiveTripUpdate.updateMany(
                { user: tripUserId },
                {
                    $addToSet: {
                        followers: {
                            user: followerId,
                            notificationPreference
                        }
                    }
                }
            );

            return true;
        } catch (error) {
            throw new Error(`Failed to follow trip: ${error.message}`);
        }
    }

    // Community Services
    async createCommunityGroup(creatorId, groupData) {
        try {
            const group = new CommunityGroup({
                creator: creatorId,
                moderators: [creatorId],
                members: [{
                    user: creatorId,
                    role: 'moderator'
                }],
                stats: { memberCount: 1 },
                ...groupData
            });

            await group.save();
            return group;
        } catch (error) {
            throw new Error(`Failed to create community group: ${error.message}`);
        }
    }

    async joinCommunityGroup(groupId, userId) {
        try {
            const group = await CommunityGroup.findById(groupId);
            if (!group) {
                throw new Error('Community group not found');
            }

            if (group.members.some(member => member.user.toString() === userId)) {
                throw new Error('User is already a member');
            }

            if (group.stats.memberCount >= group.settings.maxMembers) {
                throw new Error('Group has reached maximum capacity');
            }

            group.members.push({ user: userId });
            group.stats.memberCount += 1;

            await group.save();
            return group;
        } catch (error) {
            throw new Error(`Failed to join community group: ${error.message}`);
        }
    }

    async createCommunityPost(authorId, postData) {
        try {
            const post = new CommunityPost({
                author: authorId,
                ...postData
            });

            await post.save();

            // Update group post count
            if (postData.group) {
                await CommunityGroup.findByIdAndUpdate(postData.group, {
                    $inc: { 'stats.postCount': 1 }
                });
            }

            return post.populate('author', 'username avatar');
        } catch (error) {
            throw new Error(`Failed to create community post: ${error.message}`);
        }
    }

    // Gamification Services
    async initializeUserGamification(userId) {
        try {
            const existingStats = await GamificationStats.findOne({ user: userId });
            if (existingStats) {
                return existingStats;
            }

            const stats = new GamificationStats({
                user: userId,
                lastActivity: new Date()
            });

            await stats.save();
            return stats;
        } catch (error) {
            throw new Error(`Failed to initialize gamification: ${error.message}`);
        }
    }

    async awardPoints(userId, category, points, reason = '') {
        try {
            const stats = await GamificationStats.findOne({ user: userId });
            if (!stats) {
                throw new Error('User gamification not initialized');
            }

            stats.totalPoints += points;
            stats.categories[category] = (stats.categories[category] || 0) + points;
            
            // Check for level up
            const newLevel = Math.floor(stats.totalPoints / 1000) + 1;
            if (newLevel > stats.level) {
                stats.level = newLevel;
                await this.checkAchievements(userId, 'level_up', newLevel);
            }

            stats.lastActivity = new Date();
            await stats.save();

            return stats;
        } catch (error) {
            throw new Error(`Failed to award points: ${error.message}`);
        }
    }

    async checkAchievements(userId, trigger, value) {
        try {
            const achievements = await Achievement.find({ isActive: true });
            const userAchievements = await HighImpactUserAchievement.find({ user: userId });
            const completedAchievementIds = userAchievements
                .filter(ua => ua.isCompleted)
                .map(ua => ua.achievement.toString());

            for (const achievement of achievements) {
                if (completedAchievementIds.includes(achievement._id.toString())) {
                    continue;
                }

                const shouldAward = await this.evaluateAchievement(userId, achievement, trigger, value);
                if (shouldAward) {
                    await this.awardAchievement(userId, achievement._id);
                }
            }
        } catch (error) {
            console.error('Failed to check achievements:', error);
        }
    }

    async evaluateAchievement(userId, achievement, trigger, value) {
        // Simplified achievement evaluation logic
        if (achievement.criteria.metric === 'level' && trigger === 'level_up') {
            return value >= achievement.criteria.threshold;
        }
        
        if (achievement.criteria.metric === 'countries_visited' && trigger === 'country_visited') {
            const userBlogs = await Blog.find({ author: userId });
            const countries = [...new Set(userBlogs.map(blog => blog.location?.country).filter(Boolean))];
            return countries.length >= achievement.criteria.threshold;
        }

        return false;
    }

    async awardAchievement(userId, achievementId) {
        try {
            const achievement = await Achievement.findById(achievementId);
            if (!achievement) {
                return;
            }

            const userAchievement = new HighImpactUserAchievement({
                user: userId,
                achievement: achievementId,
                progress: {
                    current: achievement.criteria.threshold,
                    target: achievement.criteria.threshold,
                    percentage: 100
                },
                isCompleted: true,
                completedAt: new Date()
            });

            await userAchievement.save();

            // Award points for achievement
            await this.awardPoints(userId, 'achievements', achievement.rewards.points, `Achievement: ${achievement.title}`);

            // Update achievement stats
            achievement.stats.totalEarned += 1;
            await achievement.save();

            return userAchievement;
        } catch (error) {
            console.error('Failed to award achievement:', error);
        }
    }

    async getUserGamificationProfile(userId) {
        try {
            const stats = await GamificationStats.findOne({ user: userId });
            const achievements = await HighImpactUserAchievement.find({ user: userId, isCompleted: true })
                .populate('achievement')
                .sort({ completedAt: -1 });

            const profile = {
                stats: stats || {},
                achievements: achievements || [],
                level: stats?.level || 1,
                totalPoints: stats?.totalPoints || 0,
                nextLevelPoints: ((stats?.level || 1) * 1000) - (stats?.totalPoints || 0),
                categoryBreakdown: stats?.categories || {}
            };

            return profile;
        } catch (error) {
            throw new Error(`Failed to get gamification profile: ${error.message}`);
        }
    }

    // Utility methods
    async getHighImpactAnalytics(userId) {
        try {
            const analytics = {
                collaboration: {
                    sessionsHosted: await CollaborationSession.countDocuments({ host: userId }),
                    sessionsJoined: await CollaborationSession.countDocuments({ 'collaborators.user': userId })
                },
                emergency: {
                    contactsAdded: await EmergencyContact.countDocuments({ user: userId }),
                    alertsCreated: await EmergencyAlert.countDocuments({ user: userId })
                },
                blockchain: {
                    certificatesEarned: await BlockchainCertificate.countDocuments({ user: userId }),
                    certificatesMinted: await BlockchainCertificate.countDocuments({ user: userId, isMinted: true })
                },
                community: {
                    groupsJoined: await CommunityGroup.countDocuments({ 'members.user': userId }),
                    postsCreated: await CommunityPost.countDocuments({ author: userId }),
                    groupsCreated: await CommunityGroup.countDocuments({ creator: userId })
                },
                gamification: {
                    totalPoints: (await GamificationStats.findOne({ user: userId }))?.totalPoints || 0,
                    achievementsUnlocked: await HighImpactUserAchievement.countDocuments({ user: userId, isCompleted: true }),
                    currentLevel: (await GamificationStats.findOne({ user: userId }))?.level || 1
                }
            };

            return analytics;
        } catch (error) {
            throw new Error(`Failed to get analytics: ${error.message}`);
        }
    }
}

module.exports = new HighImpactService();
