import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// PHOTO GALLERY APIs

// Create gallery
export const createGallery = async (galleryData) => {
  const response = await axios.post(`${API_URL}/gallery/galleries`, galleryData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Add photos to gallery
export const addPhotosToGallery = async (galleryId, photos) => {
  const response = await axios.post(
    `${API_URL}/gallery/galleries/${galleryId}/photos`,
    { photos },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Get user galleries
export const getUserGalleries = async (userId, page = 1, limit = 12) => {
  const response = await axios.get(`${API_URL}/gallery/galleries/user/${userId}`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get single gallery
export const getGallery = async (galleryId) => {
  const response = await axios.get(`${API_URL}/gallery/galleries/${galleryId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Toggle gallery like
export const toggleGalleryLike = async (galleryId) => {
  const response = await axios.post(
    `${API_URL}/gallery/galleries/${galleryId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Delete gallery
export const deleteGallery = async (galleryId) => {
  const response = await axios.delete(`${API_URL}/gallery/galleries/${galleryId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// STORY APIs

// Create story
export const createStory = async (storyData) => {
  const response = await axios.post(`${API_URL}/gallery/stories`, storyData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get following stories
export const getFollowingStories = async () => {
  const response = await axios.get(`${API_URL}/gallery/stories/following`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get user stories
export const getUserStories = async (userId) => {
  const response = await axios.get(`${API_URL}/gallery/stories/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// View story
export const viewStory = async (storyId) => {
  const response = await axios.post(
    `${API_URL}/gallery/stories/${storyId}/view`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Delete story
export const deleteStory = async (storyId) => {
  const response = await axios.delete(`${API_URL}/gallery/stories/${storyId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get story viewers
export const getStoryViewers = async (storyId) => {
  const response = await axios.get(`${API_URL}/gallery/stories/${storyId}/viewers`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};
