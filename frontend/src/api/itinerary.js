import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create itinerary
export const createItinerary = async (itineraryData) => {
  const response = await axios.post(`${API_URL}/itinerary`, itineraryData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get user itineraries
export const getUserItineraries = async (userId, page = 1, limit = 10, status = null) => {
  const response = await axios.get(`${API_URL}/itinerary/user/${userId}`, {
    params: { page, limit, status },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get single itinerary
export const getItinerary = async (itineraryId) => {
  const response = await axios.get(`${API_URL}/itinerary/${itineraryId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Update itinerary
export const updateItinerary = async (itineraryId, updates) => {
  const response = await axios.put(`${API_URL}/itinerary/${itineraryId}`, updates, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Add day to itinerary
export const addDay = async (itineraryId, dayData) => {
  const response = await axios.post(`${API_URL}/itinerary/${itineraryId}/days`, dayData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Add activity to day
export const addActivity = async (itineraryId, dayId, activityData) => {
  const response = await axios.post(
    `${API_URL}/itinerary/${itineraryId}/days/${dayId}/activities`,
    activityData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Toggle like itinerary
export const toggleItineraryLike = async (itineraryId) => {
  const response = await axios.post(
    `${API_URL}/itinerary/${itineraryId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Toggle save itinerary
export const toggleItinerarySave = async (itineraryId) => {
  const response = await axios.post(
    `${API_URL}/itinerary/${itineraryId}/save`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Get saved itineraries
export const getSavedItineraries = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/itinerary/saved`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Add collaborator
export const addCollaborator = async (itineraryId, userId, role = 'viewer') => {
  const response = await axios.post(
    `${API_URL}/itinerary/${itineraryId}/collaborators`,
    { userId, role },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Delete itinerary
export const deleteItinerary = async (itineraryId) => {
  const response = await axios.delete(`${API_URL}/itinerary/${itineraryId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Search itineraries
export const searchItineraries = async (filters = {}, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/itinerary/search`, {
    params: { ...filters, page, limit }
  });
  return response.data;
};
