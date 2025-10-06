import api from './api';

// Like/Unlike content
export const toggleLike = async (targetType, targetId) => {
  try {
    const response = await api.post('/likes', {
      targetType,
      targetId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get like status for content
export const getLikeStatus = async (targetType, targetId) => {
  try {
    const response = await api.get(`/likes/status/${targetType}/${targetId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get likes for content
export const getLikes = async (targetType, targetId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/likes/${targetType}/${targetId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's liked content
export const getUserLikes = async (userId = null, page = 1, limit = 20) => {
  try {
    const endpoint = userId ? `/likes/user/${userId}` : '/likes/user';
    const response = await api.get(endpoint, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get most liked content
export const getMostLiked = async (targetType = 'Blog', timeframe = '7d', limit = 10) => {
  try {
    const response = await api.get('/likes/most-liked', {
      params: { targetType, timeframe, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  toggleLike,
  getLikeStatus,
  getLikes,
  getUserLikes,
  getMostLiked
};