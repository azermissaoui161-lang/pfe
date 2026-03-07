const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');  // ← ✅ CORRIGÉ
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');

router.use(protect);

router.get('/stats', getCategoryStats);

router.route('/')
  .get(getAllCategories)
  .post(authorize('admin_principal', 'admin_stock'), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(authorize('admin_principal', 'admin_stock'), updateCategory)
  .delete(authorize('admin_principal'), deleteCategory);

module.exports = router;