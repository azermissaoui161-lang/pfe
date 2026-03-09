const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences
} = require('../controllers/userController');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.get('/preferences/:module', getPreferences);
router.put('/preferences/:module', updatePreferences);

module.exports = router;