import api from './api';

// Social API endpoints

// Follow/Unfollow users
export const followUser = async (userId) => {
  try {
    const response = await api.post('/social/follow', { userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await api.post('/social/unfollow', { userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user followers and following
export const getFollowers = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/users/${userId}/followers`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFollowing = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/users/${userId}/following`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFollowerCount = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/followers/count`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFollowingCount = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/following/count`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check if user is following another user
export const checkFollowingStatus = async (userId) => {
  try {
    const response = await api.get(`/social/following-status/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Share content
export const recordShare = async (targetType, targetId, platform) => {
  try {
    const response = await api.post('/social/share', {
      targetType,
      targetId,
      platform
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getShareStats = async (targetType, targetId) => {
  try {
    const response = await api.get(`/social/stats/${targetType}/${targetId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTrendingShares = async (targetType = 'Blog', timeframe = '7d', limit = 10) => {
  try {
    const response = await api.get('/social/trending', {
      params: { targetType, timeframe, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Email sharing
export const emailShare = async (shareData) => {
  try {
    const response = await api.post('/social/email-share', shareData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's social feed
export const getSocialFeed = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/social/feed', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get recommended users to follow
export const getRecommendedUsers = async (limit = 5) => {
  try {
    const response = await api.get('/social/recommendations', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user activity feed
export const getUserActivity = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/social/activity/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowerCount,
  getFollowingCount,
  checkFollowingStatus,
  recordShare,
  getShareStats,
  getTrendingShares,
  emailShare,
  getSocialFeed,
  getRecommendedUsers,
  getUserActivity
};