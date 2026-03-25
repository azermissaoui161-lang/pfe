const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/authController');

console.log('🔍 authRoutes chargé');
console.log('   - login est une fonction?', typeof login); // Doit afficher 'function'
console.log('   - protect est une fonction?', typeof protect); // Doit afficher 'function')

// ✅ ROUTE DE TEST (AJOUTÉE)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes working',
    timestamp: new Date().toISOString()
  });
});

// Routes publiques
router.post('/register', register);
console.log('   - Route /register configurée');
router.post('/login', login);
console.log('   - Route /login configurée');

// Routes protégées
router.post('/logout', protect, logout);
console.log('   - Route /logout configurée avec protect');
router.get('/me', protect, getMe);
console.log('   - Route /me configurée avec protect');

module.exports = router;