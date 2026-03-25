const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code compte est requis'],
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Le nom du compte est requis']
  },
  type: {
    type: String,
    required: true,
    enum: ['actif', 'passif', 'produit', 'charge', 'tresorerie']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'banque', 'caisse', 'client', 'fournisseur', 
      'capital', 'vente', 'achat', 'salaire', 'taxe',
      'immobilisation', 'stock', 'emprunt'
    ]
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'TND',
    enum: ['TND', 'EUR', 'USD']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);