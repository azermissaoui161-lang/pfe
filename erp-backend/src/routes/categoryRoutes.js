// categoryRoutes.js - Version complète
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Routes principales
router.get('/', categoryController.getAll);
router.get('/stats', roleMiddleware(['admin_principal']), categoryController.getStats); // ✅ À AJOUTER
router.get('/:id', categoryController.getOne);
router.post('/', roleMiddleware(['admin_principal', 'admin_stock']), categoryController.create);
router.put('/:id', roleMiddleware(['admin_principal', 'admin_stock']), categoryController.update);
router.delete('/:id', roleMiddleware(['admin_principal']), categoryController.delete);

module.exports = router;