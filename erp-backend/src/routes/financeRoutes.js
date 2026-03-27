// financeRoutes.js - Version corrigée pour votre controller
const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Middleware d'authentification
router.use(protect);

// ===== TABLEAU DE BORD =====

// GET /api/finance/dashboard - Dashboard financier
router.get('/dashboard',
  authorize('admin_principal', 'admin_finance'),
  financeController.getFinanceDashboard  // ✓ OK
);

// GET /api/finance/stats - Statistiques financières
router.get('/stats',
  authorize('admin_principal', 'admin_finance'),
  financeController.getFinanceStats  // ✓ OK
);

// ===== EXPORTS =====

// GET /api/finance/export/excel - Export Excel
router.get('/export/excel',
  authorize('admin_principal', 'admin_finance'),
  financeController.exportFinanceExcel  // ✓ OK
);

// GET /api/finance/export/pdf - Export PDF
router.get('/export/pdf',
  authorize('admin_principal', 'admin_finance'),
  financeController.exportFinancePDF  // ✓ OK
);

// GET /api/finance/cashflow - Flux de trésorerie
router.get('/cashflow',
  authorize('admin_principal', 'admin_finance'),
  financeController.getFinanceDashboard
);

// GET /api/finance/profit-loss - Compte de résultat
router.get('/profit-loss',
  authorize('admin_principal', 'admin_finance'),
  financeController.getFinanceStats
);

// GET /api/finance/balance-sheet - Bilan
router.get('/balance-sheet',
  authorize('admin_principal', 'admin_finance'),
  financeController.getFinanceDashboard
);

// GET /api/finance/ratios - Ratios financiers
router.get('/ratios',
  authorize('admin_principal', 'admin_finance'),
  financeController.getFinanceStats
);

// GET /api/finance/forecasts - Prévisions
router.get('/forecasts',
  authorize('admin_principal', 'admin_finance'),
  financeController.getFinanceStats
);

// GET /api/finance/export/pdf/:type - Export PDF par type
router.get('/export/pdf/:type',
  authorize('admin_principal', 'admin_finance'),
  financeController.exportFinancePDF
);

// GET /api/finance/export/excel/:type - Export Excel par type
router.get('/export/excel/:type',
  authorize('admin_principal', 'admin_finance'),
  financeController.exportFinanceExcel
);

module.exports = router;
