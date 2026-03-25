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

module.exports = router;