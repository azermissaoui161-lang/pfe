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

module.exports = router;