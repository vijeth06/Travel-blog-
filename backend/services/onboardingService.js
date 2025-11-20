const User = require('../models/User');
const RealGamificationService = require('./realGamificationService');

const ONBOARDING_STEPS = [
  'complete_profile',
  'follow_first_author',
  'post_first_comment',
  'save_first_place'
];

async function markStepCompleted(userId, stepKey) {
  try {
    if (!userId || !stepKey) return;
    if (!ONBOARDING_STEPS.includes(stepKey)) return;

    const user = await User.findById(userId);
    if (!user) return;

    if (!user.onboarding) {
      user.onboarding = { isCompleted: false, steps: [], startedAt: new Date() };
    }

    const hasStep = (user.onboarding.steps || []).some(s => s.key === stepKey);
    if (!hasStep) {
      user.onboarding.steps.push({ key: stepKey, completedAt: new Date() });
    }

    const completedKeys = new Set(user.onboarding.steps.map(s => s.key));
    const allCompleted = ONBOARDING_STEPS.every(key => completedKeys.has(key));
    const wasCompleted = !!user.onboarding.isCompleted;

    user.onboarding.isCompleted = allCompleted;
    if (allCompleted && !user.onboarding.completedAt) {
      user.onboarding.completedAt = new Date();
    }

    await user.save();

    // If onboarding just became complete, award gamification bonus
    if (allCompleted && !wasCompleted) {
      try {
        const gamification = new RealGamificationService();
        await gamification.awardPoints(userId, 'first_time', 0, {
          source: 'onboarding_completed'
        });
      } catch (err) {
        console.error('OnboardingService gamification reward error:', err.message);
      }
    }
  } catch (err) {
    console.error('OnboardingService.markStepCompleted error:', err.message);
  }
}

module.exports = {
  markStepCompleted,
  ONBOARDING_STEPS,
};
