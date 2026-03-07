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
  getCustomerStats,
  getCustomerOrders  // ← Vérifiez que cette fonction existe
} = require('../controllers/customerController');

router.use(protect);

router.get('/stats', getCustomerStats);
//router.get('/:id/orders', getCustomerOrders);  // ← Ligne 18

router.route('/')
  .get(authorize('admin_principal', 'admin_facture', 'admin_finance'), getAllCustomers)
  .post(authorize('admin_principal', 'admin_facture'), createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(authorize('admin_principal', 'admin_facture'), updateCustomer)
  .delete(authorize('admin_principal'), deleteCustomer);

module.exports = router;