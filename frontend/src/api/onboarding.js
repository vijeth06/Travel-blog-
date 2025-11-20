import api from './api';

export const getOnboardingStatus = () => api.get('/onboarding');

export const completeOnboardingStep = (stepKey) =>
  api.post('/onboarding/step', { stepKey });
