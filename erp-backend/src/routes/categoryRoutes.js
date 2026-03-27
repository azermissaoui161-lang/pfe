<<<<<<< HEAD
// categoryRoutes.js - Version finale avec vérifications
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Debug (optionnel)
console.log('✅ categoryRoutes configuré avec:');
console.log('   - protect:', typeof protect === 'function' ? '✓' : '✗');
console.log('   - authorize:', typeof authorize === 'function' ? '✓' : '✗');

// Middleware d'authentification
router.use(protect);

// Routes principales
router.get('/', categoryController.getAll);
router.get('/stats', authorize('admin_principal'), categoryController.getStats);
router.post('/', authorize('admin_principal', 'admin_stock'), categoryController.create);

// Routes par ID (/:id doit être après les routes statiques)
router.get('/:id/products', categoryController.getCategoryProducts);
router.get('/:id', categoryController.getOne);
router.put('/:id', authorize('admin_principal', 'admin_stock'), categoryController.update);
router.delete('/:id', authorize('admin_principal'), categoryController.delete);
=======
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
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

module.exports = router;