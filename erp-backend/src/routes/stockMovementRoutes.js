// stockMovementRoutes.js - Version COMPLÈTE
const express = require('express');
const router = express.Router();
const stockMovementController = require('../controllers/stockMovementController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Routes principales
router.get('/', stockMovementController.getAll);
router.get('/stats', roleMiddleware(['admin_principal']), stockMovementController.getStats); // ✅ À AJOUTER
router.get('/product/:productId', stockMovementController.getByProduct); // ✅ À AJOUTER

// Routes d'écriture
router.post('/entry', roleMiddleware(['admin_principal', 'admin_stock']), stockMovementController.addEntry);
router.post('/exit', roleMiddleware(['admin_principal', 'admin_stock']), stockMovementController.addExit);
router.delete('/:id', roleMiddleware(['admin_principal']), stockMovementController.delete);

module.exports = router;