// src/routes/moduleRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getBaseModules,
  getCustomModules,
  toggleModule,
  createCustomModule
} = require('../controllers/moduleController');

// Toutes les routes nécessitent une authentification
router.use(protect);

// GET /api/modules/base - Liste des modules de base
router.get('/base', getBaseModules);

// GET /api/modules/custom - Liste des modules personnalisés
router.get('/custom', getCustomModules);

// POST /api/modules/custom - Créer un module personnalisé
router.post('/custom', authorize('admin_principal'), createCustomModule);

// PATCH /api/modules/:id/toggle - Activer/désactiver un module
router.patch('/:id/toggle', authorize('admin_principal'), toggleModule);

module.exports = router;
