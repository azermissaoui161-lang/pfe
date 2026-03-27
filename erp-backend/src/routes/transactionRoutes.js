<<<<<<< HEAD
// transactionRoutes.js - Version corrigée pour votre controller
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Debug
console.log('🔍 transactionController chargé avec:', Object.keys(transactionController));

// Middleware d'authentification
router.use(protect);

// ===== ROUTES PRINCIPALES =====

// GET /api/transactions - Liste toutes les transactions
router.get('/', 
  authorize('admin_principal', 'admin_finance'), 
  transactionController.getAll
);

// GET /api/transactions/stats - Statistiques
router.get('/stats',
  authorize('admin_principal', 'admin_finance'),
  transactionController.getStats
);

// GET /api/transactions/trial-balance - Balance comptable
router.get('/trial-balance',
  authorize('admin_principal', 'admin_finance'),
  transactionController.getTrialBalance
);

// GET /api/transactions/range - Transactions par plage de dates
router.get('/range',
  authorize('admin_principal', 'admin_finance'),
  transactionController.getByDateRange
);

// GET /api/transactions/export/csv - Export CSV
router.get('/export/csv',
  authorize('admin_principal', 'admin_finance'),
  transactionController.exportToCSV
);

// GET /api/transactions/account/:accountId - Transactions par compte
router.get('/account/:accountId',
  authorize('admin_principal', 'admin_finance'),
  transactionController.getByAccount
);

// POST /api/transactions/bulk - Création en masse
router.post('/bulk', 
  authorize('admin_principal'), 
  transactionController.bulkCreate
);

// GET /api/transactions/ledger/:accountId - Grand livre par compte
router.get('/ledger/:accountId', 
  authorize('admin_principal', 'admin_finance'), 
  transactionController.getLedger
);

// ===== ROUTES PAR ID =====

// GET /api/transactions/:id - Détail d'une transaction
router.get('/:id', 
  authorize('admin_principal', 'admin_finance'), 
  transactionController.getById  // ← Note: getById, pas getOne
);

// POST /api/transactions - Créer une transaction
router.post('/', 
  authorize('admin_principal', 'admin_finance'), 
  transactionController.create
);

// PUT /api/transactions/:id - Mettre à jour une transaction
router.put('/:id', 
  authorize('admin_principal'), 
  transactionController.update
);

// DELETE /api/transactions/:id - Supprimer une transaction
router.delete('/:id', 
  authorize('admin_principal'), 
  transactionController.delete
);

// PATCH /api/transactions/:id/validate - Valider une transaction
router.patch('/:id/validate', 
  authorize('admin_principal'), 
  transactionController.validate
);
=======
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  validateTransaction,
  getAccountLedger,
  getTrialBalance
} = require('../controllers/transactionController');

router.use(protect);

// Routes spécifiques
router.get('/trial-balance', authorize('admin_principal', 'admin_finance'), getTrialBalance);
router.get('/ledger/:accountId', authorize('admin_principal', 'admin_finance'), getAccountLedger);
router.patch('/:id/validate', authorize('admin_principal', 'admin_finance'), validateTransaction);

// Routes CRUD
router.route('/')
  .get(authorize('admin_principal', 'admin_finance'), getAllTransactions)
  .post(authorize('admin_principal', 'admin_finance'), createTransaction);

router.route('/:id')
  .get(getTransactionById)
  .put(authorize('admin_principal', 'admin_finance'), updateTransaction)
  .delete(authorize('admin_principal'), deleteTransaction);
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

module.exports = router;