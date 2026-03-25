const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  exportFinanceExcel,
  exportFinancePDF,
  getFinanceDashboard,
  getFinanceStats
} = require('../controllers/financeController');

router.use(protect);

// Routes principales
router.get('/dashboard', authorize('admin_principal', 'admin_finance'), getFinanceDashboard);
router.get('/stats', authorize('admin_principal', 'admin_finance'), getFinanceStats);
router.get('/export/excel', authorize('admin_principal', 'admin_finance'), exportFinanceExcel);
router.get('/export/pdf', authorize('admin_principal', 'admin_finance'), exportFinancePDF);

module.exports = router;