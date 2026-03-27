// src/controllers/moduleController.js

// Modules de base du système ERP
const BASE_MODULES = [
  { id: 'dashboard', name: 'Tableau de bord', description: 'Vue d\'ensemble de l\'activité', icon: 'dashboard', active: true, isBase: true },
  { id: 'products', name: 'Produits', description: 'Gestion des produits et du catalogue', icon: 'inventory', active: true, isBase: true },
  { id: 'stock', name: 'Stock', description: 'Gestion des mouvements de stock', icon: 'warehouse', active: true, isBase: true },
  { id: 'suppliers', name: 'Fournisseurs', description: 'Gestion des fournisseurs', icon: 'local_shipping', active: true, isBase: true },
  { id: 'customers', name: 'Clients', description: 'Gestion des clients', icon: 'people', active: true, isBase: true },
  { id: 'orders', name: 'Commandes', description: 'Gestion des commandes achats et ventes', icon: 'shopping_cart', active: true, isBase: true },
  { id: 'invoices', name: 'Factures', description: 'Gestion de la facturation', icon: 'receipt', active: true, isBase: true },
  { id: 'payments', name: 'Paiements', description: 'Suivi des paiements', icon: 'payment', active: true, isBase: true },
  { id: 'accounts', name: 'Comptabilité', description: 'Plan comptable et comptes', icon: 'account_balance', active: true, isBase: true },
  { id: 'transactions', name: 'Transactions', description: 'Écritures comptables', icon: 'swap_horiz', active: true, isBase: true },
  { id: 'budgets', name: 'Budgets', description: 'Gestion budgétaire', icon: 'pie_chart', active: true, isBase: true },
  { id: 'reports', name: 'Rapports', description: 'Rapports et analyses', icon: 'bar_chart', active: true, isBase: true },
  { id: 'notifications', name: 'Notifications', description: 'Système de notifications', icon: 'notifications', active: true, isBase: true },
  { id: 'users', name: 'Utilisateurs', description: 'Gestion des utilisateurs et rôles', icon: 'manage_accounts', active: true, isBase: true }
];

// Modules personnalisés (stockés en mémoire pour l'instant)
let customModules = [
  { id: 'analytics', name: 'Analytics Avancées', description: 'Analyses avancées et KPIs', icon: 'analytics', active: false, isBase: false },
  { id: 'crm', name: 'CRM', description: 'Gestion de la relation client', icon: 'contact_page', active: false, isBase: false }
];

// GET /api/modules/base - Liste des modules de base
const getBaseModules = async (req, res) => {
  try {
    res.json({
      success: true,
      data: BASE_MODULES,
      count: BASE_MODULES.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/modules/custom - Liste des modules personnalisés
const getCustomModules = async (req, res) => {
  try {
    res.json({
      success: true,
      data: customModules,
      count: customModules.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/modules/:id/toggle - Activer/désactiver un module
const toggleModule = async (req, res) => {
  try {
    const { id } = req.params;

    // Chercher dans les modules de base (non modifiables)
    const baseModule = BASE_MODULES.find(m => m.id === id);
    if (baseModule) {
      return res.status(400).json({
        success: false,
        message: 'Les modules de base ne peuvent pas être désactivés'
      });
    }

    // Chercher dans les modules personnalisés
    const customIndex = customModules.findIndex(m => m.id === id);
    if (customIndex === -1) {
      return res.status(404).json({ success: false, message: 'Module non trouvé' });
    }

    customModules[customIndex].active = !customModules[customIndex].active;

    res.json({
      success: true,
      data: customModules[customIndex],
      message: `Module ${customModules[customIndex].active ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/modules/custom - Créer un module personnalisé
const createCustomModule = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Le nom du module est requis' });
    }

    const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const existing = [...BASE_MODULES, ...customModules].find(m => m.id === id || m.name === name);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Un module avec ce nom existe déjà' });
    }

    const newModule = {
      id,
      name: name.trim(),
      description: description || '',
      icon: icon || 'extension',
      active: true,
      isBase: false,
      createdAt: new Date().toISOString()
    };

    customModules.push(newModule);

    res.status(201).json({
      success: true,
      data: newModule,
      message: 'Module personnalisé créé avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBaseModules,
  getCustomModules,
  toggleModule,
  createCustomModule
};
