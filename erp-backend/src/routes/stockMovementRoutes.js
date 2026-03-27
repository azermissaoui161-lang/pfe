<<<<<<< HEAD
// stockMovementRoutes.js - Version corrigée pour votre controller
const express = require('express');
const router = express.Router();
const stockMovementController = require('../controllers/stockMovementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Debug
console.log('🔍 stockMovementController chargé avec:', Object.keys(stockMovementController));

// Middleware d'authentification
router.use(protect);

// ===== ROUTES PRINCIPALES =====

// GET /api/stock - Liste tous les mouvements
router.get('/', stockMovementController.getAll);

// GET /api/stock/stats - Statistiques globales
router.get('/stats',
  authorize('admin_principal', 'admin_stock'),
  stockMovementController.getStats
);

// GET /api/stock/history - Historique des mouvements
router.get('/history',
  stockMovementController.getHistory
);

// GET /api/stock/product/:productId - Mouvements d'un produit spécifique
router.get('/product/:productId', 
  stockMovementController.getByProduct
);

// ===== ROUTES D'AJOUT DE MOUVEMENTS =====

// POST /api/stock/entry - Ajouter une entrée de stock
router.post('/entry', 
  authorize('admin_principal', 'admin_stock'), 
  stockMovementController.addEntry
);

// POST /api/stock/exit - Ajouter une sortie de stock
router.post('/exit', 
  authorize('admin_principal', 'admin_stock'), 
  stockMovementController.addExit
);

// ===== ROUTES PAR ID =====

// DELETE /api/stock/:id - Supprimer un mouvement
router.delete('/:id', 
  authorize('admin_principal'), 
  stockMovementController.delete
);

// ===== NOTES =====
// Les routes suivantes NE SONT PAS disponibles dans votre controller :
// - GET /:id        (getOne n'existe pas)
// - PUT /:id        (update n'existe pas)
// - POST /          (create n'existe pas)
=======
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
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

module.exports = router;