<<<<<<< HEAD
// supplierRoutes.js - Version corrigée
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');  // ← CORRECTION: destructurer protect
const { authorize } = require('../middleware/roleMiddleware'); // ← CORRECTION: destructurer authorize

// Debug
console.log('🔍 supplierController chargé avec:', Object.keys(supplierController));

// Middleware d'authentification - CORRECTION: utiliser protect au lieu de authMiddleware
router.use(protect);

// Routes spécifiques (AVANT /:id)
router.get('/stats', supplierController.getStats);
router.get('/search', supplierController.search);

// Routes principales
router.get('/', supplierController.getAll);
router.post('/', authorize('admin_principal', 'admin_stock'), supplierController.create);

// Routes par ID
router.get('/:id/products', supplierController.getSupplierProducts);
router.get('/:id', supplierController.getOne);
router.put('/:id', authorize('admin_principal', 'admin_stock'), supplierController.update);
router.delete('/:id', authorize('admin_principal'), supplierController.delete);
=======
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createSupplier,
  getSuppliers,        // ← Changé: getAllSuppliers → getSuppliers
  updateSupplier
  // getSupplierById, deleteSupplier, getSupplierStats manquent
} = require('../controllers/supplierController');

router.use(protect);

// router.get('/stats', getSupplierStats); // Commenté car non défini

router.route('/')
  .get(authorize('admin_principal', 'admin_stock'), getSuppliers)  // ← Changé
  .post(authorize('admin_principal', 'admin_stock'), createSupplier);

router.route('/:id')
  // .get(getSupplierById) // Commenté car non défini
  .put(authorize('admin_principal', 'admin_stock'), updateSupplier);
  // .delete(authorize('admin_principal'), deleteSupplier); // Commenté car non défini
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

module.exports = router;