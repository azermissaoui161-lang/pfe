const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');  // ← ✅ CORRIGÉ
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/productController');

router.use(protect);

router.route('/')
  .get(getAllProducts)
  .post(authorize('admin_principal', 'admin_stock'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('admin_principal', 'admin_stock'), updateProduct)
  .delete(authorize('admin_principal'), deleteProduct);

router.patch('/:id/stock', authorize('admin_principal', 'admin_stock'), updateStock);

module.exports = router;