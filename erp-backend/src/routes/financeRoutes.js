// routes/financeRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getFinanceDashboard,
  getFinanceStats,
  exportFinanceExcel,
  exportFinancePDF,
  getCashFlow,
  getProfitLoss,
  getBalanceSheet,
  getFinancialRatios,
  getBudgetVsActual,
  getMonthlyTrends
} = require('../controllers/financeController');

// Toutes les routes nécessitent une authentification
router.use(protect);

// ===== DASHBOARD & STATISTIQUES =====

/**
 * @route   GET /api/finance/dashboard
 * @desc    Obtenir les indicateurs clés du dashboard financier
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/dashboard', authorize('admin_principal', 'admin_finance'), getFinanceDashboard);

/**
 * @route   GET /api/finance/stats
 * @desc    Obtenir les statistiques financières générales
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/stats', authorize('admin_principal', 'admin_finance'), getFinanceStats);

// ===== ANALYSES FINANCIÈRES =====

/**
 * @route   GET /api/finance/cashflow
 * @desc    Obtenir le tableau des flux de trésorerie
 * @query   {startDate, endDate, period} - Période d'analyse
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/cashflow', authorize('admin_principal', 'admin_finance'), getCashFlow);

/**
 * @route   GET /api/finance/profit-loss
 * @desc    Obtenir le compte de résultat
 * @query   {startDate, endDate, compareWithPrevious} - Période d'analyse
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/profit-loss', authorize('admin_principal', 'admin_finance'), getProfitLoss);

/**
 * @route   GET /api/finance/balance-sheet
 * @desc    Obtenir le bilan comptable
 * @query   {date} - Date du bilan
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/balance-sheet', authorize('admin_principal', 'admin_finance'), getBalanceSheet);

/**
 * @route   GET /api/finance/ratios
 * @desc    Obtenir les ratios financiers
 * @query   {date} - Date d'analyse
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/ratios', authorize('admin_principal', 'admin_finance'), getFinancialRatios);

/**
 * @route   GET /api/finance/budget-vs-actual
 * @desc    Comparaison budget vs réalisé
 * @query   {month, year} - Période de comparaison
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/budget-vs-actual', authorize('admin_principal', 'admin_finance'), getBudgetVsActual);

/**
 * @route   GET /api/finance/trends
 * @desc    Obtenir les tendances mensuelles
 * @query   {months, type} - Nombre de mois et type (revenue, expenses, profit)
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/trends', authorize('admin_principal', 'admin_finance'), getMonthlyTrends);

// ===== EXPORTS =====

/**
 * @route   GET /api/finance/export/excel
 * @desc    Exporter les données financières au format Excel
 * @query   {startDate, endDate, type, format} - Paramètres d'export
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/export/excel', authorize('admin_principal', 'admin_finance'), (req, res, next) => {
  // Ajout de paramètres par défaut si non fournis
  req.query.format = req.query.format || 'detailed';
  exportFinanceExcel(req, res, next);
});

/**
 * @route   GET /api/finance/export/pdf
 * @desc    Exporter les données financières au format PDF
 * @query   {startDate, endDate, type, template} - Paramètres d'export
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/export/pdf', authorize('admin_principal', 'admin_finance'), (req, res, next) => {
  // Ajout de paramètres par défaut si non fournis
  req.query.template = req.query.template || 'standard';
  exportFinancePDF(req, res, next);
});

/**
 * @route   GET /api/finance/export/csv
 * @desc    Exporter les données financières au format CSV
 * @query   {startDate, endDate, type, fields} - Paramètres d'export
 * @access  Private (admin_finance, admin_principal)
 */
router.get('/export/csv', authorize('admin_principal', 'admin_finance'), (req, res, next) => {
  // À implémenter dans le controller si nécessaire
  res.status(501).json({ 
    success: false, 
    message: 'Export CSV non encore implémenté' 
  });
});

// ===== RAPPORTS PROGRAMMÉS =====

/**
 * @route   POST /api/finance/reports/schedule
 * @desc    Programmer un rapport automatique
 * @body    {type, frequency, recipients, format}
 * @access  Private (admin_principal uniquement)
 */
router.post('/reports/schedule', authorize('admin_principal'), (req, res) => {
  // À implémenter avec un système de cron jobs
  res.status(501).json({ 
    success: false, 
    message: 'Rapports programmés non encore implémentés' 
  });
});

/**
 * @route   GET /api/finance/reports/scheduled
 * @desc    Liste des rapports programmés
 * @access  Private (admin_principal uniquement)
 */
router.get('/reports/scheduled', authorize('admin_principal'), (req, res) => {
  // À implémenter
  res.status(501).json({ 
    success: false, 
    message: 'Non encore implémenté' 
  });
});

module.exports = router;