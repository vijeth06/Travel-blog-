const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const onboardingController = require('../controllers/onboardingController');

router.use(protect);

router.get('/', onboardingController.getOnboardingStatus);
router.post('/step', onboardingController.completeOnboardingStep);

module.exports = router;
