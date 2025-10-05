import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all blogs with optional filters
export const getBlogs = async (params = {}) => {
  try {
    const response = await API.get('/blogs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get single blog by ID
export const getBlogById = async (id) => {
  try {
    const response = await API.get(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Alias for backward compatibility
export const getBlog = getBlogById;

// Create new blog
export const createBlog = async (blogData) => {
  try {
    const response = await API.post('/blogs', blogData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Update blog
export const updateBlog = async (id, blogData) => {
  try {
    const response = await API.put(`/blogs/${id}`, blogData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Delete blog
export const deleteBlog = async (id) => {
  try {
    const response = await API.delete(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get featured blogs
export const getFeaturedBlogs = async (limit = 5) => {
  try {
    const response = await API.get('/blogs/featured', { params: { limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get trending blogs
export const getTrendingBlogs = async (limit = 5) => {
  try {
    const response = await API.get('/blogs/trending', { params: { limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Search blogs
export const searchBlogs = async (query, filters = {}) => {
  try {
    const response = await API.get('/blogs/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Like/Unlike blog
export const toggleBlogLike = async (blogId) => {
  try {
    const response = await API.post('/likes/toggle', {
      targetType: 'Blog',
      targetId: blogId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get like status for blog
export const getBlogLikeStatus = async (blogId) => {
  try {
    const response = await API.get(`/likes/status/Blog/${blogId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get comments for blog
export const getBlogComments = async (blogId, params = {}) => {
  try {
    const response = await API.get(`/comments/blog/${blogId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Add comment to blog
export const addBlogComment = async (blogId, content, parentComment = null) => {
  try {
    const response = await API.post('/comments', {
      blog: blogId,
      content,
      parentComment
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Delete comment
export const deleteBlogComment = async (commentId) => {
  try {
    const response = await API.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Flag comment
export const flagBlogComment = async (commentId) => {
  try {
    const response = await API.post(`/comments/${commentId}/flag`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
