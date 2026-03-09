const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getOne);
router.post('/', roleMiddleware(['admin_principal', 'admin_stock']), supplierController.create);
router.put('/:id', roleMiddleware(['admin_principal', 'admin_stock']), supplierController.update);
router.delete('/:id', roleMiddleware(['admin_principal']), supplierController.delete);

module.exports = router;