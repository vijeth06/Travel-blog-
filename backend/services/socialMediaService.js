const axios = require('axios');
const { SocialMediaIntegration } = require('../models/Integrations');

class SocialMediaService {
    constructor() {
        this.platforms = {
            facebook: {
                baseUrl: 'https://graph.facebook.com/v18.0',
                scope: 'pages_manage_posts,pages_read_engagement,publish_to_groups'
            },
            instagram: {
                baseUrl: 'https://graph.instagram.com',
                scope: 'instagram_basic,instagram_content_publish'
            },
            twitter: {
                baseUrl: 'https://api.twitter.com/2',
                scope: 'tweet.read,tweet.write,users.read'
            },
            pinterest: {
                baseUrl: 'https://api.pinterest.com/v5',
                scope: 'boards:read,pins:read,pins:write'
            },
            linkedin: {
                baseUrl: 'https://api.linkedin.com/v2',
                scope: 'w_member_social,r_liteprofile'
            }
        };
    }

    // Connect Social Media Account
    async connectAccount(userId, platform, accessToken, additionalData = {}) {
        try {
            let userProfile;
            
            switch (platform) {
                case 'facebook':
                    userProfile = await this.getFacebookProfile(accessToken);
                    break;
                case 'instagram':
                    userProfile = await this.getInstagramProfile(accessToken);
                    break;
                case 'twitter':
                    userProfile = await this.getTwitterProfile(accessToken);
                    break;
                case 'pinterest':
                    userProfile = await this.getPinterestProfile(accessToken);
                    break;
                case 'linkedin':
                    userProfile = await this.getLinkedInProfile(accessToken);
                    break;
                default:
                    throw new Error('Unsupported platform');
            }

            const integration = await SocialMediaIntegration.findOneAndUpdate(
                { user: userId, platform },
                {
                    accessToken,
                    refreshToken: additionalData.refreshToken,
                    expiresAt: additionalData.expiresAt,
                    platformUserId: userProfile.id,
                    username: userProfile.username,
                    settings: {
                        ...additionalData.settings,
                        defaultHashtags: this.getDefaultHashtags(platform)
                    },
                    isActive: true
                },
                { upsert: true, new: true }
            );

            return {
                success: true,
                integration,
                profile: userProfile
            };
        } catch (error) {
            console.error(`${platform} connection error:`, error);
            throw new Error(`Failed to connect ${platform} account`);
        }
    }

    // Auto Post to Social Media
    async autoPost(userId, blogData) {
        try {
            const integrations = await SocialMediaIntegration.find({
                user: userId,
                isActive: true,
                'settings.autoPost': true,
                'settings.postOnBlogPublish': true
            });

            const results = [];

            for (const integration of integrations) {
                try {
                    const postData = this.formatPostContent(integration, blogData);
                    let postResult;

                    switch (integration.platform) {
                        case 'facebook':
                            postResult = await this.postToFacebook(integration, postData);
                            break;
                        case 'instagram':
                            postResult = await this.postToInstagram(integration, postData);
                            break;
                        case 'twitter':
                            postResult = await this.postToTwitter(integration, postData);
                            break;
                        case 'pinterest':
                            postResult = await this.postToPinterest(integration, postData);
                            break;
                        case 'linkedin':
                            postResult = await this.postToLinkedIn(integration, postData);
                            break;
                    }

                    // Update last post time
                    integration.lastPost = new Date();
                    await integration.save();

                    results.push({
                        platform: integration.platform,
                        success: true,
                        postId: postResult.id,
                        url: postResult.url
                    });
                } catch (error) {
                    console.error(`Failed to post to ${integration.platform}:`, error);
                    results.push({
                        platform: integration.platform,
                        success: false,
                        error: error.message
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Auto post error:', error);
            throw new Error('Failed to auto post to social media');
        }
    }

    // Facebook Methods
    async getFacebookProfile(accessToken) {
        const response = await axios.get(
            `${this.platforms.facebook.baseUrl}/me`,
            {
                params: {
                    access_token: accessToken,
                    fields: 'id,name,email,picture'
                }
            }
        );
        
        return {
            id: response.data.id,
            username: response.data.name,
            email: response.data.email,
            avatar: response.data.picture?.data?.url
        };
    }

    async postToFacebook(integration, postData) {
        const response = await axios.post(
            `${this.platforms.facebook.baseUrl}/me/feed`,
            {
                message: postData.text,
                link: postData.url,
                access_token: integration.accessToken
            }
        );

        return {
            id: response.data.id,
            url: `https://facebook.com/${response.data.id}`
        };
    }

    // Instagram Methods
    async getInstagramProfile(accessToken) {
        const response = await axios.get(
            `${this.platforms.instagram.baseUrl}/me`,
            {
                params: {
                    access_token: accessToken,
                    fields: 'id,username,account_type,media_count'
                }
            }
        );
        
        return {
            id: response.data.id,
            username: response.data.username,
            type: response.data.account_type,
            mediaCount: response.data.media_count
        };
    }

    async postToInstagram(integration, postData) {
        // Instagram requires a two-step process: create media object, then publish
        
        // Step 1: Create media object
        const mediaResponse = await axios.post(
            `${this.platforms.instagram.baseUrl}/me/media`,
            {
                image_url: postData.image,
                caption: postData.text,
                access_token: integration.accessToken
            }
        );

        // Step 2: Publish media
        const publishResponse = await axios.post(
            `${this.platforms.instagram.baseUrl}/me/media_publish`,
            {
                creation_id: mediaResponse.data.id,
                access_token: integration.accessToken
            }
        );

        return {
            id: publishResponse.data.id,
            url: `https://instagram.com/p/${publishResponse.data.id}`
        };
    }

    // Twitter Methods
    async getTwitterProfile(accessToken) {
        const response = await axios.get(
            `${this.platforms.twitter.baseUrl}/users/me`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    'user.fields': 'id,username,name,profile_image_url,public_metrics'
                }
            }
        );
        
        return {
            id: response.data.data.id,
            username: response.data.data.username,
            name: response.data.data.name,
            avatar: response.data.data.profile_image_url,
            followers: response.data.data.public_metrics.followers_count
        };
    }

    async postToTwitter(integration, postData) {
        const response = await axios.post(
            `${this.platforms.twitter.baseUrl}/tweets`,
            {
                text: postData.text
            },
            {
                headers: {
                    'Authorization': `Bearer ${integration.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            id: response.data.data.id,
            url: `https://twitter.com/${integration.username}/status/${response.data.data.id}`
        };
    }

    // Pinterest Methods
    async getPinterestProfile(accessToken) {
        const response = await axios.get(
            `${this.platforms.pinterest.baseUrl}/user_account`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        return {
            id: response.data.id,
            username: response.data.username,
            name: response.data.account_type,
            avatar: response.data.profile_image,
            website: response.data.website_url
        };
    }

    async postToPinterest(integration, postData) {
        // First, get user's boards
        const boardsResponse = await axios.get(
            `${this.platforms.pinterest.baseUrl}/boards`,
            {
                headers: {
                    'Authorization': `Bearer ${integration.accessToken}`
                }
            }
        );

        const defaultBoard = boardsResponse.data.items[0]; // Use first board

        // Create pin
        const response = await axios.post(
            `${this.platforms.pinterest.baseUrl}/pins`,
            {
                board_id: defaultBoard.id,
                media_source: {
                    source_type: 'image_url',
                    url: postData.image
                },
                title: postData.title,
                description: postData.text,
                link: postData.url
            },
            {
                headers: {
                    'Authorization': `Bearer ${integration.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            id: response.data.id,
            url: `https://pinterest.com/pin/${response.data.id}`
        };
    }

    // LinkedIn Methods
    async getLinkedInProfile(accessToken) {
        const response = await axios.get(
            `${this.platforms.linkedin.baseUrl}/people/~`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    projection: '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'
                }
            }
        );
        
        return {
            id: response.data.id,
            username: `${response.data.firstName.localized.en_US} ${response.data.lastName.localized.en_US}`,
            name: `${response.data.firstName.localized.en_US} ${response.data.lastName.localized.en_US}`,
            avatar: response.data.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier
        };
    }

    async postToLinkedIn(integration, postData) {
        const response = await axios.post(
            `${this.platforms.linkedin.baseUrl}/ugcPosts`,
            {
                author: `urn:li:person:${integration.platformUserId}`,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: {
                            text: postData.text
                        },
                        shareMediaCategory: 'ARTICLE',
                        media: [
                            {
                                status: 'READY',
                                description: {
                                    text: postData.title
                                },
                                originalUrl: postData.url,
                                title: {
                                    text: postData.title
                                }
                            }
                        ]
                    }
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${integration.accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            }
        );

        return {
            id: response.headers['x-restli-id'],
            url: `https://linkedin.com/feed/update/${response.headers['x-restli-id']}`
        };
    }

    // Utility Methods
    formatPostContent(integration, blogData) {
        const settings = integration.settings;
        let text = settings.postTemplate || 'Just published: {{title}} {{url}}';
        
        // Replace template variables
        text = text
            .replace('{{title}}', blogData.title)
            .replace('{{url}}', `${process.env.BASE_URL}/blogs/${blogData._id}`)
            .replace('{{author}}', blogData.author.name)
            .replace('{{location}}', blogData.location || '');

        // Add hashtags
        if (settings.includeHashtags && settings.defaultHashtags.length > 0) {
            const hashtags = settings.defaultHashtags.map(tag => `#${tag}`).join(' ');
            text += `\n\n${hashtags}`;
        }

        // Platform-specific formatting
        if (integration.platform === 'twitter') {
            text = this.truncateForTwitter(text);
        }

        return {
            text,
            title: blogData.title,
            url: `${process.env.BASE_URL}/blogs/${blogData._id}`,
            image: blogData.images?.[0] || blogData.coverImage
        };
    }

    truncateForTwitter(text, maxLength = 280) {
        if (text.length <= maxLength) return text;
        
        // Find last complete word that fits
        const truncated = text.substring(0, maxLength - 3);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return truncated.substring(0, lastSpace) + '...';
    }

    getDefaultHashtags(platform) {
        const commonTags = ['travel', 'travelblogger', 'wanderlust', 'adventure'];
        
        const platformTags = {
            instagram: [...commonTags, 'instatravel', 'travelgram', 'explore'],
            twitter: [...commonTags, 'TravelTuesday', 'Wanderlust'],
            pinterest: [...commonTags, 'TravelInspiration', 'VacationIdeas'],
            facebook: [...commonTags, 'TravelPhotography'],
            linkedin: ['travel', 'business travel', 'networking', 'professional']
        };

        return platformTags[platform] || commonTags;
    }

    // Schedule Post
    async schedulePost(userId, platform, postData, scheduledTime) {
        try {
            // This would integrate with a job queue like Bull or Agenda
            // For now, we'll store the scheduled post and handle it with a cron job
            
            const integration = await SocialMediaIntegration.findOne({
                user: userId,
                platform,
                isActive: true
            });

            if (!integration) {
                throw new Error('Platform integration not found');
            }

            // Store scheduled post (you'd implement a ScheduledPost model)
            const scheduledPost = {
                user: userId,
                platform,
                content: postData,
                scheduledTime,
                status: 'pending',
                createdAt: new Date()
            };

            // Add to job queue
            // await this.jobQueue.add('social-media-post', scheduledPost, {
            //     delay: scheduledTime.getTime() - Date.now()
            // });

            return {
                success: true,
                scheduledPost
            };
        } catch (error) {
            console.error('Schedule post error:', error);
            throw new Error('Failed to schedule post');
        }
    }

    // Get Social Media Analytics
    async getAnalytics(userId, platform, timeRange = '30d') {
        try {
            const integration = await SocialMediaIntegration.findOne({
                user: userId,
                platform,
                isActive: true
            });

            if (!integration) {
                throw new Error('Platform integration not found');
            }

            let analytics;
            
            switch (platform) {
                case 'facebook':
                    analytics = await this.getFacebookAnalytics(integration, timeRange);
                    break;
                case 'instagram':
                    analytics = await this.getInstagramAnalytics(integration, timeRange);
                    break;
                case 'twitter':
                    analytics = await this.getTwitterAnalytics(integration, timeRange);
                    break;
                default:
                    throw new Error('Analytics not available for this platform');
            }

            return analytics;
        } catch (error) {
            console.error('Get analytics error:', error);
            throw new Error('Failed to get social media analytics');
        }
    }

    async getFacebookAnalytics(integration, timeRange) {
        // Implementation for Facebook Page Insights API
        // This would require additional permissions and setup
        return {
            followers: 0,
            engagement: 0,
            reach: 0,
            posts: 0
        };
    }

    async getInstagramAnalytics(integration, timeRange) {
        // Implementation for Instagram Basic Display API
        return {
            followers: 0,
            engagement: 0,
            reach: 0,
            posts: 0
        };
    }

    async getTwitterAnalytics(integration, timeRange) {
        // Implementation for Twitter API v2 metrics
        return {
            followers: 0,
            engagement: 0,
            impressions: 0,
            tweets: 0
        };
    }

    // Delete Integration
    async deleteIntegration(userId, platform) {
        try {
            const result = await SocialMediaIntegration.deleteOne({ 
                user: userId, 
                platform 
            });

            if (result.deletedCount === 0) {
                throw new Error('Integration not found');
            }

            return { success: true };
        } catch (error) {
            console.error('Delete integration error:', error);
            throw new Error('Failed to delete integration');
        }
    }
}

module.exports = new SocialMediaService();