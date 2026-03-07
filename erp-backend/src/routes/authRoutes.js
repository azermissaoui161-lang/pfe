const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile  // ← AJOUTER CETTE IMPORTATION
} = require('../controllers/authController');

console.log('🔍 authRoutes chargé');
console.log('   - login est une fonction?', typeof login);
console.log('   - protect est une fonction?', typeof protect);

// ✅ ROUTE DE TEST
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

// ✅ NOUVELLE ROUTE POUR METTRE À JOUR LE PROFIL
router.put('/profile', protect, updateProfile);
console.log('   - Route /profile configurée avec protect (PUT)');

module.exports = router;