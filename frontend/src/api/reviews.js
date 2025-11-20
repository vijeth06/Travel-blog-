import axios from 'axios';
import { API_URL as BASE_URL } from '../config/api';

const API_URL = BASE_URL;

// Create review
export const createReview = async (reviewData) => {
  const response = await axios.post(`${API_URL}/reviews`, reviewData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get reviews for item
export const getReviews = async (targetType, targetId, filters = {}) => {
  const response = await axios.get(`${API_URL}/reviews/${targetType}/${targetId}`, {
    params: filters
  });
  return response.data;
};

// Get single review
export const getReview = async (reviewId) => {
  const response = await axios.get(`${API_URL}/reviews/single/${reviewId}`);
  return response.data;
};

// Update review
export const updateReview = async (reviewId, updates) => {
  const response = await axios.put(`${API_URL}/reviews/${reviewId}`, updates, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Delete review
export const deleteReview = async (reviewId) => {
  const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId) => {
  const response = await axios.post(
    `${API_URL}/reviews/${reviewId}/helpful`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Report review
export const reportReview = async (reviewId, reason) => {
  const response = await axios.post(
    `${API_URL}/reviews/${reviewId}/report`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Get user's reviews
export const getUserReviews = async (userId, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/reviews/user/${userId}`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get review statistics
export const getReviewStats = async (targetType, targetId) => {
  const response = await axios.get(`${API_URL}/reviews/${targetType}/${targetId}/stats`);
  return response.data;
};
