// productRoutes.js - Version complète
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStock,
  updateCategory,
  getStats
} = require('../controllers/productController');

router.use(protect);

// Routes principales
router.route('/')
  .get(getAllProducts)
  .post(authorize('admin_principal', 'admin_stock'), createProduct);

// Routes spécifiques (AVANT /:id)
router.get('/stock/alert', getLowStock);  // ✅ À AJOUTER
router.get('/stats', authorize('admin_principal'), getStats);  // ✅ À AJOUTER
router.put('/update-category', authorize('admin_principal'), updateCategory);  // ✅ À AJOUTER

// Route par ID
router.route('/:id')
  .get(getProductById)
  .put(authorize('admin_principal', 'admin_stock'), updateProduct)
  .delete(authorize('admin_principal'), deleteProduct);

// Route spécifique pour mise à jour du stock
router.patch('/:id/stock', authorize('admin_principal', 'admin_stock'), updateStock);

module.exports = router;