import api from './api';

// Get subscription plans
export const getPremiumPlans = async () => {
  const response = await api.get('/api/real-premium/plans');
  return response.data;
};

// Get current subscription
export const getCurrentSubscription = async () => {
  const response = await api.get('/api/real-premium/subscription');
  return response.data;
};

// Subscribe to a plan
export const subscribeToPlan = async (planData) => {
  const response = await api.post('/api/real-premium/subscribe', planData);
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async () => {
  const response = await api.post('/api/real-premium/cancel');
  return response.data;
};

// Get subscription history
export const getSubscriptionHistory = async () => {
  const response = await api.get('/api/real-premium/history');
  return response.data;
};

// Get premium features status
export const getPremiumFeatures = async () => {
  const response = await api.get('/api/real-premium/features');
  return response.data;
};
