// src/controllers/transactionController.js
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

<<<<<<< HEAD
/**
 * Formatter une transaction pour le frontend
 */
const formatTransaction = (transaction) => ({
  id: transaction._id,
  transactionNumber: transaction.transactionNumber,
  date: transaction.date,
  description: transaction.description,
  entries: transaction.entries.map(entry => ({
    id: entry._id,
    account: entry.account,
    debit: entry.debit,
    credit: entry.credit,
    label: entry.label
  })),
  totalDebit: transaction.totalDebit,
  totalCredit: transaction.totalCredit,
  reference: transaction.reference,
  referenceId: transaction.referenceId,
  referenceModel: transaction.referenceModel,
  status: transaction.status,
  createdBy: transaction.createdBy,
  validatedBy: transaction.validatedBy,
  validatedAt: transaction.validatedAt,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt
});

/**
 * Gérer les erreurs de manière sécurisée
 */
const handleError = (error, res, defaultMessage = 'Erreur serveur') => {
  console.error(`❌ ${defaultMessage}:`, error);
  const message = process.env.NODE_ENV === 'production' 
    ? defaultMessage 
    : error.message;
  res.status(500).json({ success: false, message });
};

/**
 * Valider les entrées comptables
 */
const validateEntries = async (entries) => {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    throw new Error('Au moins une écriture est requise');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const entry of entries) {
    // Vérifier le compte
    if (!mongoose.Types.ObjectId.isValid(entry.account)) {
      throw new Error(`ID de compte invalide: ${entry.account}`);
    }

    const account = await Account.findById(entry.account);
    if (!account) {
      throw new Error(`Compte ${entry.account} non trouvé`);
    }

    // Vérifier les montants
    const debit = parseFloat(entry.debit) || 0;
    const credit = parseFloat(entry.credit) || 0;

    if (debit < 0 || credit < 0) {
      throw new Error('Les montants ne peuvent pas être négatifs');
    }

    if (debit > 0 && credit > 0) {
      throw new Error('Une ligne ne peut pas avoir à la fois débit et crédit');
    }

    if (debit === 0 && credit === 0) {
      throw new Error('Une ligne doit avoir soit un débit soit un crédit');
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) { // Tolérance pour arrondis
    throw new Error(`Déséquilibre: Débit (${totalDebit.toFixed(2)}) ≠ Crédit (${totalCredit.toFixed(2)})`);
  }

  return { totalDebit, totalCredit };
};

/**
 * Générer un numéro de transaction unique
 */
const generateTransactionNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await Transaction.countDocuments({
    transactionNumber: { $regex: `^ECR-${year}${month}` }
  });
  return `ECR-${year}${month}-${String(count + 1).padStart(6, '0')}`;
};

// ===== POST /api/transactions =====
exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { date, description, entries, reference, referenceId, referenceModel } = req.body;

    // Validations
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: 'La description est requise' 
      });
    }

    // Valider les écritures
    const { totalDebit, totalCredit } = await validateEntries(entries);
=======
// @desc    Créer une écriture comptable
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { date, description, entries, reference, referenceId, referenceModel } = req.body;

    // Calculer les totaux
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      totalDebit += entry.debit || 0;
      totalCredit += entry.credit || 0;

      // Vérifier que le compte existe
      const account = await Account.findById(entry.account);
      if (!account) {
        return res.status(404).json({ 
          success: false,
          message: `Compte ${entry.account} non trouvé` 
        });
      }
    }

    // Vérifier l'équilibre
    if (totalDebit !== totalCredit) {
      return res.status(400).json({ 
        success: false,
        message: `Déséquilibre: Débit (${totalDebit}) ≠ Crédit (${totalCredit})` 
      });
    }
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

    // Générer le numéro de transaction
    const transactionNumber = await generateTransactionNumber();

<<<<<<< HEAD
    // Créer la transaction
    const transaction = await Transaction.create([{
      transactionNumber,
      date: date || new Date(),
      description: description.trim(),
      entries: entries.map(e => ({
        account: e.account,
        debit: parseFloat(e.debit) || 0,
        credit: parseFloat(e.credit) || 0,
        label: e.label || description
      })),
=======
    const transaction = await Transaction.create({
      transactionNumber,
      date: date || new Date(),
      description,
      entries,
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
      totalDebit,
      totalCredit,
      reference,
      referenceId,
      referenceModel,
      status: 'brouillon',
      createdBy: req.user._id
<<<<<<< HEAD
    }], { session });

    // Journaliser
    await AuditLog.create([{
      user: req.user._id,
      action: 'CREATE',
      entity: 'TRANSACTION',
      entityId: transaction[0]._id,
      details: { 
        transactionNumber: transaction[0].transactionNumber,
        totalDebit,
        totalCredit
      },
      ipAddress: req.ip
    }], { session });

    await session.commitTransaction();

    const populatedTransaction = await Transaction.findById(transaction[0]._id)
      .populate('entries.account', 'code name type')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: formatTransaction(populatedTransaction),
      message: 'Transaction créée avec succès'
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error.message.includes('Déséquilibre') || 
        error.message.includes('invalide') || 
        error.message.includes('requise')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    handleError(error, res, 'Erreur lors de la création de la transaction');
  } finally {
    session.endSession();
  }
};

// ===== GET /api/transactions =====
exports.getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      accountId, 
      status,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Filtres par date
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Filtre par statut
    if (status) filter.status = status;

    // Filtre par compte
    if (accountId) {
      filter['entries.account'] = new mongoose.Types.ObjectId(accountId);
    }

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { transactionNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    // Construction du tri
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('entries.account', 'code name type')
        .populate('createdBy', 'firstName lastName')
        .populate('validatedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    // Calculer les totaux pour la page
    const totals = transactions.reduce((acc, t) => ({
      totalDebit: acc.totalDebit + t.totalDebit,
      totalCredit: acc.totalCredit + t.totalCredit
    }), { totalDebit: 0, totalCredit: 0 });

    res.json({
      success: true,
      data: transactions.map(formatTransaction),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      totals
    });

  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des transactions');
  }
};

// ===== GET /api/transactions/:id =====
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID transaction invalide' 
      });
    }

    const transaction = await Transaction.findById(id)
      .populate('entries.account', 'code name type')
      .populate('createdBy', 'firstName lastName')
      .populate('validatedBy', 'firstName lastName')
      .lean();

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction non trouvée' 
      });
    }

    res.json({
      success: true,
      data: formatTransaction(transaction)
    });

  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération de la transaction');
  }
};

// ===== PUT /api/transactions/:id =====
exports.update = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { description, entries } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID transaction invalide' 
      });
    }

    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction non trouvée' 
      });
    }

    if (transaction.status !== 'brouillon') {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de modifier une transaction validée' 
      });
    }

    // Mise à jour des champs
    if (description) {
      transaction.description = description.trim();
    }

    if (entries) {
      const { totalDebit, totalCredit } = await validateEntries(entries);
      
      transaction.entries = entries.map(e => ({
        account: e.account,
        debit: parseFloat(e.debit) || 0,
        credit: parseFloat(e.credit) || 0,
        label: e.label || description
      }));
      transaction.totalDebit = totalDebit;
      transaction.totalCredit = totalCredit;
    }

    transaction.updatedAt = Date.now();
    await transaction.save({ session });

    // Journaliser
    await AuditLog.create([{
      user: req.user._id,
      action: 'UPDATE',
      entity: 'TRANSACTION',
      entityId: transaction._id,
      details: { 
        transactionNumber: transaction.transactionNumber,
        updatedFields: Object.keys(req.body)
      },
      ipAddress: req.ip
    }], { session });

    await session.commitTransaction();

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('entries.account', 'code name type')
      .populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      data: formatTransaction(updatedTransaction),
      message: 'Transaction mise à jour avec succès'
    });

  } catch (error) {
    await session.abortTransaction();

    if (error.message.includes('Déséquilibre') || 
        error.message.includes('invalide')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    handleError(error, res, 'Erreur lors de la mise à jour de la transaction');
  } finally {
    session.endSession();
  }
};

// ===== DELETE /api/transactions/:id =====
exports.delete = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID transaction invalide' 
      });
    }

    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
=======
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      entity: 'TRANSACTION',
      entityId: transaction._id,
      details: { 
        transactionNumber: transaction.transactionNumber,
        totalDebit,
        totalCredit
      },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction créée avec succès'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Récupérer toutes les transactions
// @route   GET /api/transactions
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, accountId, status } = req.query;
    
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) query.status = status;
    
    if (accountId) {
      query['entries.account'] = accountId;
    }

    const transactions = await Transaction.find(query)
      .populate('entries.account', 'code name')
      .populate('createdBy', 'firstName lastName')
      .populate('validatedBy', 'firstName lastName')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Récupérer une transaction par ID
// @route   GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('entries.account', 'code name')
      .populate('createdBy', 'firstName lastName')
      .populate('validatedBy', 'firstName lastName');

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction non trouvée' 
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Mettre à jour une transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
        message: 'Transaction non trouvée' 
      });
    }

    if (transaction.status !== 'brouillon') {
      return res.status(400).json({ 
<<<<<<< HEAD
        success: false, 
=======
        success: false,
        message: 'Impossible de modifier une transaction validée' 
      });
    }

    const { description, entries } = req.body;

    if (description) transaction.description = description;
    
    if (entries) {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const entry of entries) {
        totalDebit += entry.debit || 0;
        totalCredit += entry.credit || 0;

        const account = await Account.findById(entry.account);
        if (!account) {
          return res.status(404).json({ 
            success: false,
            message: `Compte ${entry.account} non trouvé` 
          });
        }
      }

      if (totalDebit !== totalCredit) {
        return res.status(400).json({ 
          success: false,
          message: `Déséquilibre: Débit (${totalDebit}) ≠ Crédit (${totalCredit})` 
        });
      }

      transaction.entries = entries;
      transaction.totalDebit = totalDebit;
      transaction.totalCredit = totalCredit;
    }

    await transaction.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      entity: 'TRANSACTION',
      entityId: transaction._id,
      details: { transactionNumber: transaction.transactionNumber },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: transaction,
      message: 'Transaction mise à jour'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Supprimer une transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction non trouvée' 
      });
    }

    if (transaction.status !== 'brouillon') {
      return res.status(400).json({ 
        success: false,
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
        message: 'Impossible de supprimer une transaction validée' 
      });
    }

<<<<<<< HEAD
    await transaction.deleteOne({ session });

    // Journaliser
    await AuditLog.create([{
      user: req.user._id,
      action: 'DELETE',
      entity: 'TRANSACTION',
      entityId: id,
      details: { transactionNumber: transaction.transactionNumber },
      ipAddress: req.ip
    }], { session });

    await session.commitTransaction();
=======
    await transaction.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE',
      entity: 'TRANSACTION',
      entityId: req.params.id,
      details: { transactionNumber: transaction.transactionNumber },
      ipAddress: req.ip
    });
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

    res.json({
      success: true,
      message: 'Transaction supprimée avec succès'
    });
<<<<<<< HEAD

  } catch (error) {
    await session.abortTransaction();
    handleError(error, res, 'Erreur lors de la suppression de la transaction');
  } finally {
    session.endSession();
  }
};

// ===== PATCH /api/transactions/:id/validate =====
exports.validate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID transaction invalide' 
      });
    }

    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
=======
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Valider une transaction
// @route   PATCH /api/transactions/:id/validate
const validateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
        message: 'Transaction non trouvée' 
      });
    }

    if (transaction.status === 'validé') {
      return res.status(400).json({ 
<<<<<<< HEAD
        success: false, 
=======
        success: false,
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
        message: 'Transaction déjà validée' 
      });
    }

<<<<<<< HEAD
    // Mettre à jour les soldes des comptes
    for (const entry of transaction.entries) {
      const account = await Account.findById(entry.account).session(session);
      if (!account) {
        throw new Error(`Compte ${entry.account} non trouvé`);
      }

      const balanceChange = (entry.debit || 0) - (entry.credit || 0);
      
      // Appliquer la règle selon le type de compte
      if (account.type === 'actif' || account.type === 'charge') {
        account.balance += balanceChange;
      } else {
        account.balance -= balanceChange;
      }

      await account.save({ session });
    }

    transaction.status = 'validé';
    transaction.validatedBy = req.user._id;
    transaction.validatedAt = Date.now();
    await transaction.save({ session });

    // Journaliser
    await AuditLog.create([{
=======
    transaction.status = 'validé';
    transaction.validatedBy = req.user._id;
    transaction.validatedAt = Date.now();
    await transaction.save();

    // Mettre à jour les soldes des comptes
    for (const entry of transaction.entries) {
      const account = await Account.findById(entry.account);
      if (account) {
        account.balance += (entry.debit || 0) - (entry.credit || 0);
        await account.save();
      }
    }

    await AuditLog.create({
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
      user: req.user._id,
      action: 'VALIDATE',
      entity: 'TRANSACTION',
      entityId: transaction._id,
<<<<<<< HEAD
      details: { 
        transactionNumber: transaction.transactionNumber,
        totalDebit: transaction.totalDebit,
        totalCredit: transaction.totalCredit
      },
      ipAddress: req.ip
    }], { session });

    await session.commitTransaction();

    const validatedTransaction = await Transaction.findById(transaction._id)
      .populate('entries.account', 'code name type')
      .populate('createdBy', 'firstName lastName')
      .populate('validatedBy', 'firstName lastName');

    res.json({
      success: true,
      data: formatTransaction(validatedTransaction),
      message: 'Transaction validée avec succès'
    });

  } catch (error) {
    await session.abortTransaction();
    handleError(error, res, 'Erreur lors de la validation de la transaction');
  } finally {
    session.endSession();
  }
};

// ===== GET /api/transactions/ledger/:accountId =====
exports.getLedger = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID compte invalide' 
      });
    }
=======
      details: { transactionNumber: transaction.transactionNumber },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: transaction,
      message: 'Transaction validée avec succès'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Grand livre des comptes
// @route   GET /api/transactions/ledger/:accountId
const getAccountLedger = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate } = req.query;
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ 
<<<<<<< HEAD
        success: false, 
=======
        success: false,
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
        message: 'Compte non trouvé' 
      });
    }

<<<<<<< HEAD
    // Construire la requête
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    const matchStage = {
      status: 'validé',
      'entries.account': new mongoose.Types.ObjectId(accountId)
    };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

<<<<<<< HEAD
    // Récupérer les transactions
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    const transactions = await Transaction.aggregate([
      { $match: matchStage },
      { $unwind: '$entries' },
      { $match: { 'entries.account': new mongoose.Types.ObjectId(accountId) } },
<<<<<<< HEAD
      { $sort: { date: 1 } },
      { $limit: parseInt(limit) }
    ]);

    // Calculer le solde initial avant la période
    let openingBalance = 0;
    if (startDate) {
      const previousTransactions = await Transaction.aggregate([
        {
          $match: {
            status: 'validé',
            date: { $lt: new Date(startDate) },
            'entries.account': new mongoose.Types.ObjectId(accountId)
          }
        },
        { $unwind: '$entries' },
        { $match: { 'entries.account': new mongoose.Types.ObjectId(accountId) } },
        {
          $group: {
            _id: null,
            totalDebit: { $sum: '$entries.debit' },
            totalCredit: { $sum: '$entries.credit' }
          }
        }
      ]);

      if (previousTransactions.length > 0) {
        const { totalDebit, totalCredit } = previousTransactions[0];
        openingBalance = (account.type === 'actif' || account.type === 'charge')
          ? totalDebit - totalCredit
          : totalCredit - totalDebit;
      }
    }

    // Calculer le solde courant
    let currentBalance = openingBalance;
    const entries = [];

    for (const trans of transactions) {
      const debit = trans.entries.debit || 0;
      const credit = trans.entries.credit || 0;

      if (account.type === 'actif' || account.type === 'charge') {
        currentBalance += debit - credit;
      } else {
        currentBalance += credit - debit;
      }

      entries.push({
        id: trans._id,
        date: trans.date,
        transactionNumber: trans.transactionNumber,
        description: trans.description,
        debit,
        credit,
        balance: currentBalance,
        reference: trans.reference
=======
      { $sort: { date: 1 } }
    ]);

    // Calculer le solde cumulé
    let balance = 0;
    const ledgerEntries = [];

    for (const trans of transactions) {
      if (account.type === 'actif' || account.type === 'charge') {
        balance += (trans.entries.debit || 0) - (trans.entries.credit || 0);
      } else {
        balance += (trans.entries.credit || 0) - (trans.entries.debit || 0);
      }

      ledgerEntries.push({
        date: trans.date,
        transactionNumber: trans.transactionNumber,
        description: trans.description,
        debit: trans.entries.debit,
        credit: trans.entries.credit,
        balance
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
      });
    }

    res.json({
      success: true,
      data: {
        account: {
<<<<<<< HEAD
          id: account._id,
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
          code: account.code,
          name: account.name,
          type: account.type
        },
<<<<<<< HEAD
        openingBalance,
        entries,
        closingBalance: currentBalance
      }
    });

  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération du grand livre');
  }
};

// ===== GET /api/transactions/trial-balance =====
exports.getTrialBalance = async (req, res) => {
=======
        entries: ledgerEntries,
        finalBalance: balance
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Balance générale
// @route   GET /api/transactions/trial-balance
const getTrialBalance = async (req, res) => {
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  try {
    const { date } = req.query;
    const balanceDate = date ? new Date(date) : new Date();

<<<<<<< HEAD
    // Récupérer tous les comptes actifs
    const accounts = await Account.find({ isActive: true }).sort('code');

    // Récupérer les transactions validées jusqu'à la date
=======
    const accounts = await Account.find({ isActive: true });

>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    const transactions = await Transaction.aggregate([
      {
        $match: {
          status: 'validé',
          date: { $lte: balanceDate }
        }
      },
      { $unwind: '$entries' },
      {
        $group: {
          _id: '$entries.account',
          totalDebit: { $sum: '$entries.debit' },
          totalCredit: { $sum: '$entries.credit' }
        }
      }
    ]);

<<<<<<< HEAD
    // Construire la balance
    const trialBalance = accounts.map(account => {
      const trans = transactions.find(t => 
        t._id.toString() === account._id.toString()
      );
      
=======
    const trialBalance = accounts.map(account => {
      const trans = transactions.find(t => t._id.toString() === account._id.toString());
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
      const debit = trans?.totalDebit || 0;
      const credit = trans?.totalCredit || 0;
      
      let balance;
      if (account.type === 'actif' || account.type === 'charge') {
        balance = debit - credit;
      } else {
        balance = credit - debit;
      }

      return {
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
<<<<<<< HEAD
        debit: Math.round(debit * 100) / 100,
        credit: Math.round(credit * 100) / 100,
        balance: Math.round(balance * 100) / 100
      };
    });

    // Calculer les totaux
=======
        debit,
        credit,
        balance
      };
    });

>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    const totals = trialBalance.reduce(
      (acc, curr) => ({
        totalDebit: acc.totalDebit + curr.debit,
        totalCredit: acc.totalCredit + curr.credit,
<<<<<<< HEAD
        totalBalance: acc.totalBalance + Math.abs(curr.balance)
=======
        totalBalance: acc.totalBalance + curr.balance
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
      }),
      { totalDebit: 0, totalCredit: 0, totalBalance: 0 }
    );

    res.json({
      success: true,
      data: {
        asOf: balanceDate,
<<<<<<< HEAD
        accounts: trialBalance,
        totals: {
          debit: Math.round(totals.totalDebit * 100) / 100,
          credit: Math.round(totals.totalCredit * 100) / 100,
          difference: Math.round((totals.totalDebit - totals.totalCredit) * 100) / 100
        }
      }
    });

  } catch (error) {
    handleError(error, res, 'Erreur lors de la génération de la balance');
  }
};

// ===== GET /api/transactions/stats =====
exports.getStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const stats = await Transaction.aggregate([
      {
        $match: {
          status: 'validé',
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $facet: {
          monthly: [
            {
              $group: {
                _id: { $month: '$date' },
                count: { $sum: 1 },
                totalDebit: { $sum: '$totalDebit' },
                totalCredit: { $sum: '$totalCredit' }
              }
            },
            { $sort: { _id: 1 } }
          ],
          byAccountType: [
            { $unwind: '$entries' },
            {
              $lookup: {
                from: 'accounts',
                localField: 'entries.account',
                foreignField: '_id',
                as: 'account'
              }
            },
            { $unwind: '$account' },
            {
              $group: {
                _id: '$account.type',
                count: { $sum: 1 },
                totalDebit: { $sum: '$entries.debit' },
                totalCredit: { $sum: '$entries.credit' }
              }
            }
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalDebit: { $sum: '$totalDebit' },
                totalCredit: { $sum: '$totalCredit' }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        monthly: stats[0].monthly,
        byAccountType: stats[0].byAccountType,
        totals: stats[0].totals[0] || { totalTransactions: 0, totalDebit: 0, totalCredit: 0 }
      }
    });

  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des statistiques');
  }
};

// ===== POST /api/transactions/bulk =====
exports.bulkCreate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Au moins une transaction est requise' 
      });
    }

    const createdTransactions = [];

    for (const transData of transactions) {
      const { date, description, entries, reference } = transData;

      // Valider les écritures
      const { totalDebit, totalCredit } = await validateEntries(entries);
      const transactionNumber = await generateTransactionNumber();

      const transaction = await Transaction.create([{
        transactionNumber,
        date: date || new Date(),
        description: description.trim(),
        entries: entries.map(e => ({
          account: e.account,
          debit: parseFloat(e.debit) || 0,
          credit: parseFloat(e.credit) || 0,
          label: e.label || description
        })),
        totalDebit,
        totalCredit,
        reference,
        status: 'brouillon',
        createdBy: req.user._id
      }], { session });

      createdTransactions.push(transaction[0]);
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: createdTransactions.map(t => ({
        id: t._id,
        transactionNumber: t.transactionNumber,
        description: t.description
      })),
      message: `${createdTransactions.length} transaction(s) créée(s) avec succès`
    });

  } catch (error) {
    await session.abortTransaction();

    if (error.message.includes('Déséquilibre')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    handleError(error, res, 'Erreur lors de la création en masse');
  } finally {
    session.endSession();
  }
};

// ===== GET /api/transactions/account/:accountId =====
exports.getByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ success: false, message: 'ID compte invalide' });
    }

    const filter = { 'entries.account': new mongoose.Types.ObjectId(accountId) };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('entries.account', 'code name type')
        .populate('createdBy', 'firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: transactions.map(formatTransaction),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des transactions du compte');
  }
};

// ===== GET /api/transactions/range =====
exports.getByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate et endDate sont requis' });
    }

    const filter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('entries.account', 'code name type')
        .populate('createdBy', 'firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: transactions.map(formatTransaction),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des transactions par période');
  }
};

// ===== GET /api/transactions/export/csv =====
exports.exportToCSV = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('entries.account', 'code name')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: -1 })
      .lean();

    const rows = [];
    rows.push(['Numéro', 'Date', 'Description', 'Référence', 'Débit Total', 'Crédit Total', 'Statut', 'Créé par'].join(','));

    transactions.forEach(t => {
      rows.push([
        t.transactionNumber || '',
        t.date ? new Date(t.date).toISOString().split('T')[0] : '',
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.reference || '',
        t.totalDebit || 0,
        t.totalCredit || 0,
        t.status || '',
        t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : ''
      ].join(','));
    });

    const csv = rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (error) {
    handleError(error, res, 'Erreur lors de l\'export des transactions');
  }
};

// Export de toutes les fonctions
module.exports = {
  create: exports.create,
  getAll: exports.getAll,
  getById: exports.getById,
  update: exports.update,
  delete: exports.delete,
  validate: exports.validate,
  getLedger: exports.getLedger,
  getTrialBalance: exports.getTrialBalance,
  getStats: exports.getStats,
  bulkCreate: exports.bulkCreate,
  getByAccount: exports.getByAccount,
  getByDateRange: exports.getByDateRange,
  exportToCSV: exports.exportToCSV
=======
        entries: trialBalance,
        totals
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// Fonction utilitaire pour générer numéro de transaction
const generateTransactionNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await Transaction.countDocuments();
  return `ECR-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

// ✅ UN SEUL export à la fin avec TOUTES les fonctions
module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  validateTransaction,
  getAccountLedger,
  getTrialBalance
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
};