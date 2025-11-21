import api from './api';

// Get user's bookmarks
export const getUserBookmarks = async (folder, type) => {
  const response = await api.get('/ux/bookmarks', {
    params: { folder, type }
  });
  return response.data;
};

// Create a bookmark
export const createBookmark = async (bookmarkData) => {
  const response = await api.post('/ux/bookmarks', bookmarkData);
  return response.data;
};

// Remove a bookmark
export const removeBookmark = async (bookmarkId) => {
  const response = await api.delete(`/ux/bookmarks/${bookmarkId}`);
  return response.data;
};

// Get bookmark folders
export const getBookmarkFolders = async () => {
  const response = await api.get('/ux/bookmarks/folders');
  return response.data;
};

// Create bookmark folder
export const createBookmarkFolder = async (folderData) => {
  const response = await api.post('/ux/bookmarks/folders', folderData);
  return response.data;
};
