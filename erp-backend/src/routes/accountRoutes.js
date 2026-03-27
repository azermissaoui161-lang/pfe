<<<<<<< HEAD
// routes/accountRoutes.js - Version CORRECTE pour les COMPTES BANCAIRES
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteAccount,
  getBalance,
  getTransactions,
  getStats,
  updateBalance,
  search
} = require('../controllers/accountController');

// Toutes les routes nécessitent authentification
router.use(protect);

// Routes spécifiques (AVANT /:id)
router.get('/stats', authorize('admin_principal', 'admin_finance'), getStats);
router.get('/search', authorize('admin_principal', 'admin_finance'), search);
router.get('/:id/balance', getBalance);
router.get('/:id/transactions', getTransactions);
router.patch('/:id/balance', authorize('admin_principal', 'admin_finance'), updateBalance);

// Routes CRUD principales
router.route('/')
  .get(authorize('admin_principal', 'admin_finance'), getAll)
  .post(authorize('admin_principal', 'admin_finance'), create);

router.route('/:id')
  .get(getById)
  .put(authorize('admin_principal', 'admin_finance'), update)
  .delete(authorize('admin_principal'), deleteAccount);
=======
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
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

module.exports = router;