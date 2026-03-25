// src/controllers/transactionController.js
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

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

    // Générer le numéro de transaction
    const transactionNumber = await generateTransactionNumber();

    const transaction = await Transaction.create({
      transactionNumber,
      date: date || new Date(),
      description,
      entries,
      totalDebit,
      totalCredit,
      reference,
      referenceId,
      referenceModel,
      status: 'brouillon',
      createdBy: req.user._id
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
        message: 'Transaction non trouvée' 
      });
    }

    if (transaction.status !== 'brouillon') {
      return res.status(400).json({ 
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
        message: 'Impossible de supprimer une transaction validée' 
      });
    }

    await transaction.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE',
      entity: 'TRANSACTION',
      entityId: req.params.id,
      details: { transactionNumber: transaction.transactionNumber },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Transaction supprimée avec succès'
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

// @desc    Valider une transaction
// @route   PATCH /api/transactions/:id/validate
const validateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction non trouvée' 
      });
    }

    if (transaction.status === 'validé') {
      return res.status(400).json({ 
        success: false,
        message: 'Transaction déjà validée' 
      });
    }

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
      user: req.user._id,
      action: 'VALIDATE',
      entity: 'TRANSACTION',
      entityId: transaction._id,
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

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ 
        success: false,
        message: 'Compte non trouvé' 
      });
    }

    const matchStage = {
      status: 'validé',
      'entries.account': new mongoose.Types.ObjectId(accountId)
    };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.aggregate([
      { $match: matchStage },
      { $unwind: '$entries' },
      { $match: { 'entries.account': new mongoose.Types.ObjectId(accountId) } },
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
      });
    }

    res.json({
      success: true,
      data: {
        account: {
          code: account.code,
          name: account.name,
          type: account.type
        },
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
  try {
    const { date } = req.query;
    const balanceDate = date ? new Date(date) : new Date();

    const accounts = await Account.find({ isActive: true });

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

    const trialBalance = accounts.map(account => {
      const trans = transactions.find(t => t._id.toString() === account._id.toString());
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
        debit,
        credit,
        balance
      };
    });

    const totals = trialBalance.reduce(
      (acc, curr) => ({
        totalDebit: acc.totalDebit + curr.debit,
        totalCredit: acc.totalCredit + curr.credit,
        totalBalance: acc.totalBalance + curr.balance
      }),
      { totalDebit: 0, totalCredit: 0, totalBalance: 0 }
    );

    res.json({
      success: true,
      data: {
        asOf: balanceDate,
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
};