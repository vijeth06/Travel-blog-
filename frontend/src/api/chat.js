import axios from 'axios';
import { API_URL as BASE_URL } from '../config/api';

const API_URL = BASE_URL;

// Search users
export const searchUsers = async (query, page = 1, limit = 20) => {
  const response = await axios.get(`${API_URL}/chat/users/search`, {
    params: { query, page, limit },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get conversations
export const getConversations = async (page = 1, limit = 20) => {
  const response = await axios.get(`${API_URL}/chat/conversations`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Get or create conversation with user
export const getOrCreateConversation = async (recipientId) => {
  const response = await axios.get(`${API_URL}/chat/conversations/${recipientId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Create group conversation
export const createGroupConversation = async (participantIds, groupName) => {
  const response = await axios.post(
    `${API_URL}/chat/conversations/group`,
    { participantIds, groupName },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Get messages in conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  const response = await axios.get(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    params: { page, limit },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Send message
export const sendMessage = async (conversationId, content, attachments = []) => {
  const response = await axios.post(
    `${API_URL}/chat/conversations/${conversationId}/messages`,
    { content, attachments },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/conversations/${conversationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    // Silently fail if conversation doesn't exist yet or other errors
    console.warn('Mark as read failed:', error.message);
    return { success: false };
  }
};

// Delete message
export const deleteMessage = async (messageId) => {
  const response = await axios.delete(`${API_URL}/chat/messages/${messageId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

// Set typing status
export const setTyping = async (conversationId, isTyping) => {
  const response = await axios.post(
    `${API_URL}/chat/conversations/${conversationId}/typing`,
    { isTyping },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Archive conversation
export const archiveConversation = async (conversationId) => {
  const response = await axios.post(
    `${API_URL}/chat/conversations/${conversationId}/archive`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

// Toggle mute conversation
export const toggleMuteConversation = async (conversationId) => {
  const response = await axios.post(
    `${API_URL}/chat/conversations/${conversationId}/mute`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};
