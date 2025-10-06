const TravelForum = require('../models/TravelForum');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

class ForumService {
  constructor() {
    this.reputationActions = {
      'topic-create': 10,
      'post-create': 5,
      'post-like': 2,
      'post-dislike': -1,
      'best-answer': 50,
      'post-reported': -10,
      'moderator-action': 25
    };
  }

  async createTopic(userId, topicData) {
    try {
      const { ForumTopic } = TravelForum;
      
      const topic = new ForumTopic({
        ...topicData,
        author: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await topic.save();

      // Update user forum profile
      await this.updateUserReputation(userId, 'topic-create');

      return await ForumTopic.findById(topic._id)
        .populate('author', 'name avatar')
        .populate('category');

    } catch (error) {
      console.error('Create topic error:', error);
      throw new Error('Failed to create forum topic');
    }
  }

  async createPost(userId, topicId, postData) {
    try {
      const { ForumTopic, ForumPost } = TravelForum;
      
      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        throw new Error('Topic not found');
      }

      if (topic.status === 'closed') {
        throw new Error('Cannot post to a closed topic');
      }

      const post = new ForumPost({
        topic: topicId,
        author: userId,
        content: postData.content,
        attachments: postData.attachments || [],
        createdAt: new Date()
      });

      await post.save();

      // Update topic stats
      topic.stats.replies++;
      topic.stats.lastActivity = new Date();
      topic.stats.lastPost = post._id;
      await topic.save();

      // Update user reputation
      await this.updateUserReputation(userId, 'post-create');

      // Notify topic subscribers
      await this.notifyTopicSubscribers(topicId, post, userId);

      return await ForumPost.findById(post._id)
        .populate('author', 'name avatar');

    } catch (error) {
      console.error('Create post error:', error);
      throw new Error('Failed to create forum post');
    }
  }

  async getTopics(filters = {}) {
    try {
      const { ForumTopic } = TravelForum;
      
      const {
        category,
        status = 'open',
        sort = 'recent',
        page = 1,
        limit = 20,
        search
      } = filters;

      // Build query
      let query = {};
      
      if (category) {
        query.category = category;
      }
      
      if (status !== 'all') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Build sort
      let sortQuery = {};
      switch (sort) {
        case 'recent':
          sortQuery = { 'stats.lastActivity': -1 };
          break;
        case 'popular':
          sortQuery = { 'stats.views': -1 };
          break;
        case 'replies':
          sortQuery = { 'stats.replies': -1 };
          break;
        case 'oldest':
          sortQuery = { createdAt: 1 };
          break;
        default:
          sortQuery = { 'stats.lastActivity': -1 };
      }

      const skip = (page - 1) * limit;

      const topics = await ForumTopic.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name color')
        .populate('stats.lastPost')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

      const total = await ForumTopic.countDocuments(query);

      return {
        topics,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Get topics error:', error);
      throw new Error('Failed to get forum topics');
    }
  }

  async getTopic(topicId, userId = null) {
    try {
      const { ForumTopic, ForumPost } = TravelForum;
      
      const topic = await ForumTopic.findById(topicId)
        .populate('author', 'name avatar')
        .populate('category', 'name color description');

      if (!topic) {
        throw new Error('Topic not found');
      }

      // Increment view count
      topic.stats.views++;
      await topic.save();

      // Get posts
      const posts = await ForumPost.find({ topic: topicId })
        .populate('author', 'name avatar')
        .populate('likes', 'name')
        .sort({ createdAt: 1 });

      // Check if user is subscribed
      let isSubscribed = false;
      if (userId) {
        isSubscribed = topic.subscribers.includes(userId);
      }

      return {
        topic: topic.toObject(),
        posts,
        isSubscribed
      };

    } catch (error) {
      console.error('Get topic error:', error);
      throw new Error('Failed to get forum topic');
    }
  }

  async likePost(userId, postId) {
    try {
      const { ForumPost } = TravelForum;
      
      const post = await ForumPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const userLiked = post.likes.includes(userId);

      if (userLiked) {
        // Unlike
        post.likes.pull(userId);
        await this.updateUserReputation(post.author, 'post-like', -1);
      } else {
        // Like
        post.likes.push(userId);
        post.dislikes.pull(userId); // Remove dislike if exists
        await this.updateUserReputation(post.author, 'post-like');
      }

      await post.save();

      return {
        liked: !userLiked,
        likesCount: post.likes.length,
        dislikesCount: post.dislikes.length
      };

    } catch (error) {
      console.error('Like post error:', error);
      throw new Error('Failed to like post');
    }
  }

  async markBestAnswer(userId, postId, topicId) {
    try {
      const { ForumTopic, ForumPost } = TravelForum;
      
      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        throw new Error('Topic not found');
      }

      // Check if user is topic author
      if (topic.author.toString() !== userId) {
        throw new Error('Only topic author can mark best answer');
      }

      const post = await ForumPost.findById(postId);
      if (!post || post.topic.toString() !== topicId) {
        throw new Error('Post not found or not in topic');
      }

      // Remove previous best answer
      if (topic.bestAnswer) {
        const prevBestPost = await ForumPost.findById(topic.bestAnswer);
        if (prevBestPost) {
          prevBestPost.isBestAnswer = false;
          await prevBestPost.save();
        }
      }

      // Set new best answer
      post.isBestAnswer = true;
      topic.bestAnswer = postId;
      topic.status = 'solved';

      await post.save();
      await topic.save();

      // Award reputation to post author
      await this.updateUserReputation(post.author, 'best-answer');

      return { success: true };

    } catch (error) {
      console.error('Mark best answer error:', error);
      throw new Error('Failed to mark best answer');
    }
  }

  async subscribeTo(userId, topicId) {
    try {
      const { ForumTopic } = TravelForum;
      
      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        throw new Error('Topic not found');
      }

      const isSubscribed = topic.subscribers.includes(userId);

      if (isSubscribed) {
        topic.subscribers.pull(userId);
      } else {
        topic.subscribers.push(userId);
      }

      await topic.save();

      return { subscribed: !isSubscribed };

    } catch (error) {
      console.error('Subscribe to topic error:', error);
      throw new Error('Failed to subscribe to topic');
    }
  }

  async reportPost(userId, postId, reason) {
    try {
      const { ForumPost } = TravelForum;
      
      const post = await ForumPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if user already reported
      const existingReport = post.reports.find(r => r.reporter.toString() === userId);
      if (existingReport) {
        throw new Error('You have already reported this post');
      }

      post.reports.push({
        reporter: userId,
        reason,
        reportedAt: new Date()
      });

      await post.save();

      // If enough reports, flag for moderation
      if (post.reports.length >= 3) {
        post.moderation.flagged = true;
        post.moderation.flaggedAt = new Date();
        await post.save();
      }

      return { success: true };

    } catch (error) {
      console.error('Report post error:', error);
      throw new Error('Failed to report post');
    }
  }

  async updateUserReputation(userId, action, multiplier = 1) {
    try {
      const { UserForumProfile } = TravelForum;
      
      let profile = await UserForumProfile.findOne({ user: userId });
      
      if (!profile) {
        profile = new UserForumProfile({
          user: userId,
          reputation: 0,
          rank: 'Newbie',
          stats: {
            topicsCreated: 0,
            postsCreated: 0,
            likesReceived: 0,
            bestAnswers: 0
          }
        });
      }

      const reputationChange = (this.reputationActions[action] || 0) * multiplier;
      profile.reputation = Math.max(0, profile.reputation + reputationChange);

      // Update stats
      if (action === 'topic-create') {
        profile.stats.topicsCreated++;
      } else if (action === 'post-create') {
        profile.stats.postsCreated++;
      } else if (action === 'post-like') {
        profile.stats.likesReceived += multiplier;
      } else if (action === 'best-answer') {
        profile.stats.bestAnswers++;
      }

      // Update rank based on reputation
      profile.rank = this.calculateRank(profile.reputation);

      await profile.save();

      return profile;

    } catch (error) {
      console.error('Update user reputation error:', error);
      throw new Error('Failed to update user reputation');
    }
  }

  calculateRank(reputation) {
    if (reputation >= 10000) return 'Legend';
    if (reputation >= 5000) return 'Expert';
    if (reputation >= 2000) return 'Veteran';
    if (reputation >= 1000) return 'Advanced';
    if (reputation >= 500) return 'Intermediate';
    if (reputation >= 100) return 'Beginner';
    return 'Newbie';
  }

  async getUserForumProfile(userId) {
    try {
      const { UserForumProfile } = TravelForum;
      
      let profile = await UserForumProfile.findOne({ user: userId })
        .populate('user', 'name avatar');

      if (!profile) {
        profile = new UserForumProfile({
          user: userId,
          reputation: 0,
          rank: 'Newbie',
          stats: {
            topicsCreated: 0,
            postsCreated: 0,
            likesReceived: 0,
            bestAnswers: 0
          }
        });
        await profile.save();
        profile = await UserForumProfile.findById(profile._id)
          .populate('user', 'name avatar');
      }

      return profile;

    } catch (error) {
      console.error('Get user forum profile error:', error);
      throw new Error('Failed to get user forum profile');
    }
  }

  async getForumCategories() {
    try {
      const { ForumTopic } = TravelForum;
      
      // Get categories with topic counts
      const categories = await ForumTopic.aggregate([
        {
          $group: {
            _id: '$category',
            topicCount: { $sum: 1 },
            lastActivity: { $max: '$stats.lastActivity' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $project: {
            _id: '$category._id',
            name: '$category.name',
            description: '$category.description',
            color: '$category.color',
            topicCount: 1,
            lastActivity: 1
          }
        }
      ]);

      return categories;

    } catch (error) {
      console.error('Get forum categories error:', error);
      throw new Error('Failed to get forum categories');
    }
  }

  async searchForum(searchQuery, filters = {}) {
    try {
      const { ForumTopic, ForumPost } = TravelForum;
      
      const { category, dateRange, author, sort = 'relevance' } = filters;

      // Search topics
      let topicQuery = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      };

      if (category) {
        topicQuery.category = category;
      }

      const topics = await ForumTopic.find(topicQuery)
        .populate('author', 'name avatar')
        .populate('category', 'name color')
        .limit(20);

      // Search posts
      let postQuery = {
        content: { $regex: searchQuery, $options: 'i' }
      };

      const posts = await ForumPost.find(postQuery)
        .populate('author', 'name avatar')
        .populate('topic', 'title')
        .limit(20);

      return {
        topics,
        posts,
        total: topics.length + posts.length
      };

    } catch (error) {
      console.error('Search forum error:', error);
      throw new Error('Failed to search forum');
    }
  }

  async notifyTopicSubscribers(topicId, post, authorId) {
    try {
      const { ForumTopic } = TravelForum;
      
      const topic = await ForumTopic.findById(topicId)
        .populate('subscribers', 'email name')
        .populate('author', 'name');

      // Don't notify the post author
      const subscribers = topic.subscribers.filter(
        sub => sub._id.toString() !== authorId
      );

      if (subscribers.length > 0) {
        const author = await User.findById(authorId);
        
        for (const subscriber of subscribers) {
          await sendEmail({
            to: subscriber.email,
            subject: `New reply in "${topic.title}"`,
            template: 'forum-new-reply',
            data: {
              subscriberName: subscriber.name,
              topicTitle: topic.title,
              authorName: author.name,
              postContent: post.content.substring(0, 200) + '...',
              topicUrl: `/forum/topic/${topicId}`
            }
          });
        }
      }

    } catch (error) {
      console.error('Notify topic subscribers error:', error);
    }
  }

  async getTopContributors(limit = 10) {
    try {
      const { UserForumProfile } = TravelForum;
      
      const contributors = await UserForumProfile.find()
        .populate('user', 'name avatar')
        .sort({ reputation: -1 })
        .limit(limit);

      return contributors;

    } catch (error) {
      console.error('Get top contributors error:', error);
      throw new Error('Failed to get top contributors');
    }
  }

  async getForumStats() {
    try {
      const { ForumTopic, ForumPost, UserForumProfile } = TravelForum;
      
      const [
        totalTopics,
        totalPosts,
        totalUsers,
        recentActivity
      ] = await Promise.all([
        ForumTopic.countDocuments(),
        ForumPost.countDocuments(),
        UserForumProfile.countDocuments(),
        ForumTopic.find()
          .sort({ 'stats.lastActivity': -1 })
          .limit(5)
          .populate('author', 'name avatar')
      ]);

      return {
        totalTopics,
        totalPosts,
        totalUsers,
        recentActivity
      };

    } catch (error) {
      console.error('Get forum stats error:', error);
      throw new Error('Failed to get forum stats');
    }
  }
}

module.exports = new ForumService();