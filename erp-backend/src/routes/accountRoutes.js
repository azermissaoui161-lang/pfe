// src/routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');  // ← ✅ CORRIGÉ
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/accountController');

// Toutes les routes nécessitent authentification et rôle admin_principal
router.use(protect);
router.use(authorize('admin_principal'));  // ← ✅ Maintenant authorize est disponible

// Routes principales
router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Route pour activer/désactiver un utilisateur
router.patch('/:id/toggle', toggleUserStatus);

module.exports = router;