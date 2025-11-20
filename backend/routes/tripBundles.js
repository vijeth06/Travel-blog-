const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSmartBundles } = require('../controllers/tripBundleController');

router.get('/', protect, getSmartBundles);

module.exports = router;
