const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createStockMovement,  // ← Changé: createMovement → createStockMovement
  getStockMovements,    // ← Changé: getAllMovements → getStockMovements
  getStockStats         // ← Ajouté
  // Les autres fonctions (getMovementById, updateMovement, deleteMovement) manquent
} = require('../controllers/stockMovementController');

router.use(protect);

router.get('/stats', authorize('admin_principal', 'admin_stock'), getStockStats); // ← Ajouté

router.route('/')
  .get(authorize('admin_principal', 'admin_stock'), getStockMovements)  // ← Changé
  .post(authorize('admin_principal', 'admin_stock'), createStockMovement); // ← Changé

// Commenté car les fonctions n'existent pas dans le contrôleur
// router.route('/:id')
//   .get(getMovementById)
//   .put(authorize('admin_principal', 'admin_stock'), updateMovement)
//   .delete(authorize('admin_principal'), deleteMovement);

module.exports = router;