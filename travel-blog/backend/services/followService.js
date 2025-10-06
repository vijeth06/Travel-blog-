const Follow = require('../models/Follow');
const User = require('../models/User');
const activityTracker = require('../middleware/activityTracker');

class FollowService {
  /**
   * Follow a user
   */
  static async followUser(followerId, userIdToFollow) {
    try {
      console.log(`👤 FOLLOW: User ${followerId} attempting to follow ${userIdToFollow}`);
      
      // Validate inputs
      if (!followerId || !userIdToFollow) {
        throw new Error('Follower ID and User ID to follow are required');
      }
      
      if (followerId === userIdToFollow) {
        throw new Error('Cannot follow yourself');
      }
      
      // Check if the user to follow exists
      const userToFollow = await User.findById(userIdToFollow);
      if (!userToFollow) {
        throw new Error('User to follow not found');
      }
      
      // Check if already following
      const existingFollow = await Follow.findOne({
        follower: followerId,
        following: userIdToFollow
      });
      
      if (existingFollow) {
        throw new Error('Already following this user');
      }
      
      // Create follow relationship with proper error handling
      const followRelationship = await Follow.create({
        follower: followerId,
        following: userIdToFollow
      });
      
      if (!followRelationship) {
        throw new Error('Failed to create follow relationship');
      }
      
      // Track activity for gamification
      try {
        await activityTracker.trackActivity(followerId, 'user_followed', { 
          followedUserId: userIdToFollow 
        });
      } catch (activityError) {
        console.warn('⚠️ FOLLOW: Activity tracking failed:', activityError.message);
        // Don't fail the whole operation if activity tracking fails
      }
      
      // Get updated counts
      const followerCount = await Follow.countDocuments({ following: userIdToFollow });
      const followingCount = await Follow.countDocuments({ follower: followerId });
      
      console.log(`✅ FOLLOW: User ${followerId} successfully followed ${userIdToFollow}`);
      
      return {
        success: true,
        message: 'User followed successfully',
        data: {
          following: true,
          followerCount,
          followingCount,
          followedUserId: userIdToFollow,
          followerId: followerId,
          followRelationship: followRelationship._id
        }
      };
      
    } catch (error) {
      console.error('❌ FOLLOW: Follow user failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Unfollow a user
   */
  static async unfollowUser(followerId, userIdToUnfollow) {
    try {
      console.log(`👤 UNFOLLOW: User ${followerId} attempting to unfollow ${userIdToUnfollow}`);
      
      // Validate inputs
      if (!followerId || !userIdToUnfollow) {
        throw new Error('Follower ID and User ID to unfollow are required');
      }
      
      if (followerId === userIdToUnfollow) {
        throw new Error('Cannot unfollow yourself');
      }
      
      // Remove follow relationship
      const result = await Follow.findOneAndDelete({
        follower: followerId,
        following: userIdToUnfollow
      });
      
      if (!result) {
        throw new Error('Not following this user');
      }
      
      // Get updated counts
      const followerCount = await Follow.countDocuments({ following: userIdToUnfollow });
      const followingCount = await Follow.countDocuments({ follower: followerId });
      
      console.log(`✅ UNFOLLOW: User ${followerId} successfully unfollowed ${userIdToUnfollow}`);
      
      return {
        success: true,
        message: 'User unfollowed successfully',
        data: {
          following: false,
          followerCount,
          followingCount,
          unfollowedUserId: userIdToUnfollow,
          followerId: followerId
        }
      };
      
    } catch (error) {
      console.error('❌ UNFOLLOW: Unfollow user failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Get following status between two users
   */
  static async getFollowingStatus(followerId, userId) {
    try {
      console.log(`👤 STATUS: Checking if ${followerId} follows ${userId}`);
      
      // Validate inputs
      if (!followerId || !userId) {
        throw new Error('Follower ID and User ID are required');
      }
      
      // Check if following
      const isFollowing = await Follow.isFollowing(followerId, userId);
      
      // Get counts
      const followerCount = await Follow.countDocuments({ following: userId });
      const followingCount = await Follow.countDocuments({ follower: userId });
      
      // Get mutual following status
      const isMutual = await Follow.isFollowing(userId, followerId);
      
      console.log(`✅ STATUS: Follow status retrieved - Following: ${isFollowing}, Mutual: ${isMutual}`);
      
      return {
        success: true,
        data: {
          following: isFollowing,
          mutual: isMutual,
          followerCount,
          followingCount,
          userId,
          checkerId: followerId
        }
      };
      
    } catch (error) {
      console.error('❌ STATUS: Get following status failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Get user's followers with pagination
   */
  static async getFollowers(userId, options = {}) {
    try {
      console.log(`👤 FOLLOWERS: Getting followers for user ${userId}`);
      
      const { page = 1, limit = 20, populate = true } = options;
      
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get followers with pagination
      const followers = await Follow.getFollowers(userId, { page, limit, populate });
      const totalFollowers = await Follow.countDocuments({ following: userId });
      
      console.log(`✅ FOLLOWERS: Retrieved ${followers.length} followers for user ${userId}`);
      
      return {
        success: true,
        data: {
          followers,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalFollowers / limit),
            totalFollowers,
            hasNext: page * limit < totalFollowers,
            hasPrev: page > 1
          }
        }
      };
      
    } catch (error) {
      console.error('❌ FOLLOWERS: Get followers failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Get users that a user is following
   */
  static async getFollowing(userId, options = {}) {
    try {
      console.log(`👤 FOLLOWING: Getting following for user ${userId}`);
      
      const { page = 1, limit = 20, populate = true } = options;
      
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get following with pagination
      const following = await Follow.getFollowing(userId, { page, limit, populate });
      const totalFollowing = await Follow.countDocuments({ follower: userId });
      
      console.log(`✅ FOLLOWING: Retrieved ${following.length} following for user ${userId}`);
      
      return {
        success: true,
        data: {
          following,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalFollowing / limit),
            totalFollowing,
            hasNext: page * limit < totalFollowing,
            hasPrev: page > 1
          }
        }
      };
      
    } catch (error) {
      console.error('❌ FOLLOWING: Get following failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Get mutual follows between two users
   */
  static async getMutualFollows(userId1, userId2, options = {}) {
    try {
      console.log(`👤 MUTUAL: Getting mutual follows between ${userId1} and ${userId2}`);
      
      const { limit = 10 } = options;
      
      // Get users that both users follow
      const user1Following = await Follow.find({ follower: userId1 }).select('following');
      const user2Following = await Follow.find({ follower: userId2 }).select('following');
      
      const user1FollowingIds = user1Following.map(f => f.following.toString());
      const user2FollowingIds = user2Following.map(f => f.following.toString());
      
      // Find intersection
      const mutualFollowingIds = user1FollowingIds.filter(id => 
        user2FollowingIds.includes(id)
      );
      
      // Get user details for mutual follows
      const mutualFollows = await User.find({
        _id: { $in: mutualFollowingIds.slice(0, limit) }
      }).select('username email profilePicture bio');
      
      console.log(`✅ MUTUAL: Found ${mutualFollows.length} mutual follows`);
      
      return {
        success: true,
        data: {
          mutualFollows,
          totalMutual: mutualFollowingIds.length,
          hasMore: mutualFollowingIds.length > limit
        }
      };
      
    } catch (error) {
      console.error('❌ MUTUAL: Get mutual follows failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Get follow suggestions for a user
   */
  static async getFollowSuggestions(userId, options = {}) {
    try {
      console.log(`👤 SUGGESTIONS: Getting follow suggestions for user ${userId}`);
      
      const { limit = 10 } = options;
      
      // Get users that the user is already following
      const following = await Follow.find({ follower: userId }).select('following');
      const followingIds = following.map(f => f.following.toString());
      followingIds.push(userId); // Exclude self
      
      // Get users followed by people the user follows (friends of friends)
      const friendsOfFriends = await Follow.aggregate([
        { $match: { follower: { $in: followingIds } } },
        { $group: { _id: '$following', count: { $sum: 1 } } },
        { $match: { _id: { $nin: followingIds.map(id => new require('mongoose').Types.ObjectId(id)) } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);
      
      // Get user details
      const suggestionIds = friendsOfFriends.map(f => f._id);
      const suggestions = await User.find({
        _id: { $in: suggestionIds }
      }).select('username email profilePicture bio');
      
      // If we don't have enough suggestions, add popular users
      if (suggestions.length < limit) {
        const popularUsers = await User.aggregate([
          { $match: { _id: { $nin: followingIds.map(id => require('mongoose').Types.ObjectId(id)) } } },
          {
            $lookup: {
              from: 'follows',
              localField: '_id',
              foreignField: 'following',
              as: 'followers'
            }
          },
          { $addFields: { followerCount: { $size: '$followers' } } },
          { $sort: { followerCount: -1 } },
          { $limit: limit - suggestions.length },
          { $project: { username: 1, email: 1, profilePicture: 1, bio: 1, followerCount: 1 } }
        ]);
        
        suggestions.push(...popularUsers);
      }
      
      console.log(`✅ SUGGESTIONS: Generated ${suggestions.length} follow suggestions`);
      
      return {
        success: true,
        data: {
          suggestions: suggestions.slice(0, limit),
          totalSuggestions: suggestions.length
        }
      };
      
    } catch (error) {
      console.error('❌ SUGGESTIONS: Get follow suggestions failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Toggle follow status (follow if not following, unfollow if following)
   */
  static async toggleFollow(followerId, userId) {
    try {
      console.log(`👤 TOGGLE: Toggling follow status between ${followerId} and ${userId}`);
      
      // Check current status
      const isFollowing = await Follow.isFollowing(followerId, userId);
      
      if (isFollowing) {
        return await this.unfollowUser(followerId, userId);
      } else {
        return await this.followUser(followerId, userId);
      }
      
    } catch (error) {
      console.error('❌ TOGGLE: Toggle follow failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Bulk follow multiple users
   */
  static async bulkFollow(followerId, userIds) {
    try {
      console.log(`👤 BULK: User ${followerId} bulk following ${userIds.length} users`);
      
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = await this.followUser(followerId, userId);
          results.push({ userId, success: true, result });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ BULK: Bulk follow completed - ${successCount}/${userIds.length} successful`);
      
      return {
        success: true,
        data: {
          results,
          summary: {
            total: userIds.length,
            successful: successCount,
            failed: userIds.length - successCount
          }
        }
      };
      
    } catch (error) {
      console.error('❌ BULK: Bulk follow failed:', error.message);
      throw error;
    }
  }
}

module.exports = FollowService;