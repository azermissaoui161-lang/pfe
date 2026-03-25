const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentStats
} = require('../controllers/paymentController');

router.use(protect);

router.get('/stats', authorize('admin_principal', 'admin_finance', 'admin_facture'), getPaymentStats);

router.route('/')
  .get(authorize('admin_principal', 'admin_finance', 'admin_facture'), getAllPayments)
  .post(authorize('admin_principal', 'admin_finance', 'admin_facture'), createPayment);

router.route('/:id')
  .get(getPaymentById)
  .put(authorize('admin_principal', 'admin_finance', 'admin_facture'), updatePayment)
  .delete(authorize('admin_principal'), deletePayment);

module.exports = router;