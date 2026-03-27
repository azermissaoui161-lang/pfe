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

module.exports = router;