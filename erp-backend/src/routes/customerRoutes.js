<<<<<<< HEAD
// routes/customerRoutes.js
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
<<<<<<< HEAD
  toggleCustomerStatus,  // ← Présent dans le controller
  getCustomerStats,      // ← Présent dans le controller
  searchCustomers
} = require('../controllers/customerController');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes spécifiques (AVANT /:id)
router.get('/stats', getCustomerStats);
router.get('/search', searchCustomers);
router.patch('/:id/toggle', authorize('admin_principal'), toggleCustomerStatus);

// Routes pour les commandes du client (via orderController)
// Note: Ces routes sont généralement dans orderRoutes.js
// GET /api/orders?customer=:customerId

// Routes principales
=======
  getCustomerStats,
  getCustomerOrders  // ← Vérifiez que cette fonction existe
} = require('../controllers/customerController');

router.use(protect);

router.get('/stats', getCustomerStats);
//router.get('/:id/orders', getCustomerOrders);  // ← Ligne 18

>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
router.route('/')
  .get(authorize('admin_principal', 'admin_facture', 'admin_finance'), getAllCustomers)
  .post(authorize('admin_principal', 'admin_facture'), createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(authorize('admin_principal', 'admin_facture'), updateCustomer)
  .delete(authorize('admin_principal'), deleteCustomer);

module.exports = router;