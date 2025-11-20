const { successResponse, errorResponse } = require('../utils/responseHelper');
const User = require('../models/User');

// Canonical onboarding steps
const ONBOARDING_STEPS = [
  { key: 'complete_profile', label: 'Complete your profile' },
  { key: 'follow_first_author', label: 'Follow your first author' },
  { key: 'post_first_comment', label: 'Post your first comment' },
  { key: 'save_first_place', label: 'Save a favorite place' }
];

function buildStatus(user) {
  const onboarding = user.onboarding || {};
  const completedKeys = new Set((onboarding.steps || []).map(s => s.key));
  const steps = ONBOARDING_STEPS.map(step => ({
    ...step,
    completed: completedKeys.has(step.key)
  }));
  const completedCount = steps.filter(s => s.completed).length;
  const total = steps.length || 1;
  const progress = Math.round((completedCount / total) * 100);

  return {
    steps,
    isCompleted: !!onboarding.isCompleted,
    progress
  };
}

exports.getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    const status = buildStatus(user);
    return successResponse(res, status, 'Onboarding status retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get onboarding status');
  }
};

exports.completeOnboardingStep = async (req, res) => {
  try {
    const { stepKey } = req.body;
    if (!stepKey) return errorResponse(res, 'stepKey is required', 400);
    const validStep = ONBOARDING_STEPS.find(s => s.key === stepKey);
    if (!validStep) return errorResponse(res, 'Invalid onboarding step', 400);

    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    if (!user.onboarding) {
      user.onboarding = { isCompleted: false, steps: [], startedAt: new Date() };
    }

    const existing = (user.onboarding.steps || []).find(s => s.key === stepKey);
    if (!existing) {
      user.onboarding.steps.push({ key: stepKey, completedAt: new Date() });
    }

    const completedKeys = new Set(user.onboarding.steps.map(s => s.key));
    const allCompleted = ONBOARDING_STEPS.every(s => completedKeys.has(s.key));
    user.onboarding.isCompleted = allCompleted;
    if (allCompleted && !user.onboarding.completedAt) {
      user.onboarding.completedAt = new Date();
    }

    await user.save();

    const status = buildStatus(user);
    return successResponse(res, status, 'Onboarding step updated');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update onboarding step');
  }
};

exports.ONBOARDING_STEPS = ONBOARDING_STEPS;
