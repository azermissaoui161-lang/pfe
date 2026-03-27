const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');      // ✅ protect depuis authMiddleware
const { authorize } = require('../middleware/roleMiddleware');    // ✅ authorize depuis roleMiddleware
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderHistory,
  getOrderStats,
  getPendingOrders,
  getRecent,
  cancelOrder,
  generateQuote
} = require('../controllers/orderController');

router.use(protect);

router.get('/stats', authorize('admin_principal', 'admin_stock', 'admin_facture'), getOrderStats);
router.get('/history', getOrderHistory);
router.get('/pending', getPendingOrders);
router.get('/recent', getRecent);

router.route('/')
  .get(getAllOrders)
  .post(authorize('admin_principal', 'admin_stock', 'admin_facture'), createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(authorize('admin_principal', 'admin_stock', 'admin_facture'), updateOrder)
  .delete(authorize('admin_principal'), deleteOrder);

router.patch('/:id/status', authorize('admin_principal', 'admin_stock'), updateOrderStatus);
router.post('/:id/cancel', authorize('admin_principal', 'admin_stock', 'admin_facture'), cancelOrder);
router.post('/:id/quote', generateQuote);

module.exports = router;