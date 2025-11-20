import api from './api';

export const followTopic = (data) => api.post('/topic-follows', data);

export const unfollowTopic = (data) => api.delete('/topic-follows', { data });

export const getFollowedTopics = () => api.get('/topic-follows');

export const getTopicFeed = () => api.get('/topic-follows/feed');

export const checkTopicFollow = (followType, followValue) => 
  api.get(`/topic-follows/check/${followType}/${followValue}`);
