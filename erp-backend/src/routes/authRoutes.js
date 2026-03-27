const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
<<<<<<< HEAD
  refreshToken  // ← À AJOUTER
} = require('../controllers/authController');

console.log('🔍 authRoutes chargé');

// Route de test
router.get('/test', (req, res) => {
  res.json({
    success: true,
=======
  getMe
} = require('../controllers/authController');

console.log('🔍 authRoutes chargé');
console.log('   - login est une fonction?', typeof login); // Doit afficher 'function'
console.log('   - protect est une fonction?', typeof protect); // Doit afficher 'function')

// ✅ ROUTE DE TEST (AJOUTÉE)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    message: 'Auth routes working',
    timestamp: new Date().toISOString()
  });
});

// Routes publiques
router.post('/register', register);
<<<<<<< HEAD
router.post('/login', login);
router.post('/refresh-token', refreshToken); // ← À AJOUTER

// Routes protégées
router.post('/logout', protect, logout);
=======
console.log('   - Route /register configurée');
router.post('/login', login);
console.log('   - Route /login configurée');

// Routes protégées
router.post('/logout', protect, logout);
console.log('   - Route /logout configurée avec protect');
router.get('/me', protect, getMe);
console.log('   - Route /me configurée avec protect');
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

module.exports = router;