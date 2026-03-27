const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'stock_faible',
      'facture_impayee',
      'paiement_recu',
      'commande_validee',
      'produit_epuise',
      'client_nouveau',
<<<<<<< HEAD
      'transaction_effectuee',
      'facture_emise',
      'paiement_valide',
      'rapport_genere'
=======
      'transaction_effectuee'
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
<<<<<<< HEAD
  readAt: {
    type: Date,
    default: null
  },
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['basse', 'moyenne', 'haute', 'urgente'],
    default: 'moyenne'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 jours
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);