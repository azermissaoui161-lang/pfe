<<<<<<< HEAD
// controllers/accountController.js
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

/**
 * Formatter un compte pour le frontend
 */
const formatAccount = (account) => ({
  id: account._id,
  name: account.name,
  type: account.type,
  number: account.number,
  iban: account.iban,
  bic: account.bic,
  balance: account.balance,
  currency: account.currency || 'EUR',
  status: account.status,
  notes: account.notes,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt
});

/**
 * Gérer les erreurs
 */
const handleError = (error, res, defaultMessage = 'Erreur serveur') => {
  console.error(`❌ ${defaultMessage}:`, error);
  const message = process.env.NODE_ENV === 'production' ? defaultMessage : error.message;
  res.status(500).json({ success: false, message });
};

// ===== GET /api/accounts =====
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status, search } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [accounts, total] = await Promise.all([
      Account.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Account.countDocuments(filter)
    ]);

    // Calculer les totaux
    const totals = accounts.reduce((acc, a) => ({
      totalBalance: acc.totalBalance + (a.balance || 0)
    }), { totalBalance: 0 });

    res.json({
      success: true,
      data: accounts.map(formatAccount),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      totals
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des comptes');
  }
};

// ===== GET /api/accounts/:id =====
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID compte invalide' });
    }

    const account = await Account.findById(id).lean();
    if (!account) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    // Récupérer les dernières transactions
    const transactions = await Transaction.find({ 'entries.account': id })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        ...formatAccount(account),
        recentTransactions: transactions
      }
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération du compte');
  }
};

// ===== POST /api/accounts =====
exports.create = async (req, res) => {
  try {
    const { name, type, number, iban, bic, balance, currency, notes } = req.body;

    if (!name || !type) {
      return res.status(400).json({ 
        message: 'Nom et type sont requis' 
      });
    }

    // Vérifier si le numéro de compte existe déjà
    if (number) {
      const existing = await Account.findOne({ number });
      if (existing) {
        return res.status(400).json({ 
          message: 'Un compte avec ce numéro existe déjà' 
        });
      }
    }

    const account = new Account({
      name: name.trim(),
      type,
      number: number?.trim(),
      iban: iban?.replace(/\s/g, ''),
      bic: bic?.trim(),
      balance: parseFloat(balance) || 0,
      currency: currency || 'EUR',
      notes: notes?.trim(),
      createdBy: req.user._id
    });

    await account.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      entity: 'ACCOUNT',
      entityId: account._id,
      details: { name: account.name, type: account.type },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: formatAccount(account),
      message: 'Compte créé avec succès'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Un compte avec ce numéro existe déjà' 
      });
    }
    handleError(error, res, 'Erreur lors de la création du compte');
  }
};

// ===== PUT /api/accounts/:id =====
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID compte invalide' });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    // Vérifier l'unicité du numéro
    if (updates.number && updates.number !== account.number) {
      const existing = await Account.findOne({ 
        number: updates.number,
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({ 
          message: 'Un compte avec ce numéro existe déjà' 
        });
      }
    }

    // Mettre à jour les champs autorisés
    const allowedUpdates = ['name', 'type', 'number', 'iban', 'bic', 'currency', 'notes', 'status'];
    const updatedFields = [];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'iban') {
          account[field] = updates[field].replace(/\s/g, '');
        } else {
          account[field] = typeof updates[field] === 'string' 
            ? updates[field].trim() 
            : updates[field];
        }
        updatedFields.push(field);
      }
    });

    if (updatedFields.length === 0) {
      return res.status(400).json({ message: 'Aucune modification détectée' });
    }

    await account.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      entity: 'ACCOUNT',
      entityId: account._id,
      details: { updatedFields },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: formatAccount(account),
      message: 'Compte mis à jour avec succès'
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la mise à jour du compte');
  }
};

// ===== DELETE /api/accounts/:id =====
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID compte invalide' });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    // Vérifier s'il y a des transactions associées
    const transactionCount = await Transaction.countDocuments({
      'entries.account': id
    });

    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: `Impossible de supprimer: ${transactionCount} transaction(s) associée(s)` 
      });
    }

    if (Math.abs(account.balance) > 0.01) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer un compte avec un solde non nul' 
      });
    }

    await account.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE',
      entity: 'ACCOUNT',
      entityId: id,
      details: { name: account.name },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la suppression du compte');
  }
};

// ===== GET /api/accounts/:id/balance =====
exports.getBalance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID compte invalide' });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    res.json({
      success: true,
      data: {
        balance: account.balance,
        currency: account.currency
      }
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération du solde');
  }
};

// ===== GET /api/accounts/:id/transactions =====
exports.getTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID compte invalide' });
    }

    const filter = {
      status: 'validé',
      'entries.account': id
    };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      data: transactions.map(t => ({
        id: t._id,
        date: t.date,
        transactionNumber: t.transactionNumber,
        description: t.description,
        debit: t.entries.find(e => e.account.toString() === id)?.debit || 0,
        credit: t.entries.find(e => e.account.toString() === id)?.credit || 0,
        reference: t.reference
      }))
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des transactions');
  }
};

// ===== GET /api/accounts/stats =====
exports.getStats = async (req, res) => {
  try {
    const stats = await Account.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalBalance: { $sum: '$balance' },
          avgBalance: { $avg: '$balance' }
        }
      }
    ]);

    const totals = await Account.aggregate([
      {
        $group: {
          _id: null,
          totalAccounts: { $sum: 1 },
          totalBalance: { $sum: '$balance' },
          activeAccounts: {
            $sum: { $cond: [{ $eq: ['$status', 'actif'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byType: stats,
        totals: totals[0] || { totalAccounts: 0, totalBalance: 0, activeAccounts: 0 }
      }
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des statistiques');
  }
};

// ===== PATCH /api/accounts/:id/balance =====
exports.updateBalance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID compte invalide' });
    }

    const account = await Account.findById(id).session(session);
    if (!account) {
      return res.status(404).json({ message: 'Compte non trouvé' });
    }

    account.balance += amount;
    await account.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: { balance: account.balance },
      message: 'Solde mis à jour avec succès'
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(error, res, 'Erreur lors de la mise à jour du solde');
  } finally {
    session.endSession();
  }
};

// ===== GET /api/accounts/search =====
exports.search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Le paramètre q est requis' });
    }

    const accounts = await Account.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { number: { $regex: q, $options: 'i' } }
      ]
    })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: accounts.map(formatAccount)
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la recherche des comptes');
  }
};

// ✅ Export de toutes les fonctions
module.exports = {
  getAll: exports.getAll,
  getById: exports.getById,
  create: exports.create,
  update: exports.update,
  delete: exports.delete,
  getBalance: exports.getBalance,
  getTransactions: exports.getTransactions,
  getStats: exports.getStats,
  updateBalance: exports.updateBalance,
  search: exports.search
=======
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/accounts
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/accounts/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Créer un utilisateur
// @route   POST /api/accounts
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      phone,
      createdBy: req.user.id
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE',
      entity: 'USER',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip
    });

    res.status(201).json({ 
      success: true, 
      data: user.select('-password'),
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/accounts/:id
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, department, phone, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Vérifier email unique
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
      }
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    user.phone = phone || user.phone;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE',
      entity: 'USER',
      entityId: user._id,
      details: { email: user.email },
      ipAddress: req.ip
    });

    res.json({ 
      success: true, 
      data: user.select('-password'),
      message: 'Utilisateur mis à jour'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/accounts/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (user.role === 'admin_principal') {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de supprimer un administrateur principal' 
      });
    }

    await user.deleteOne();

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE',
      entity: 'USER',
      entityId: req.params.id,
      details: { email: user.email },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activer/Désactiver un utilisateur
// @route   PATCH /api/accounts/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE',
      entity: 'USER',
      entityId: user._id,
      details: { isActive: user.isActive },
      ipAddress: req.ip
    });

    res.json({ 
      success: true, 
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
};