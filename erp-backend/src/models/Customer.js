<<<<<<< HEAD
// models/Customer.js
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerNumber: {
    type: String,
<<<<<<< HEAD
    unique: true,
    sparse: true // Permet d'avoir des null temporaires avant génération
=======
    required: true,
    unique: true
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  },
  type: {
    type: String,
    enum: ['particulier', 'professionnel'],
<<<<<<< HEAD
    default: 'particulier',
    required: [true, 'Le type de client est requis']
=======
    default: 'particulier'
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  },
  civility: {
    type: String,
    enum: ['M.', 'Mme', 'Mlle', 'Société'],
    default: 'M.'
  },
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
<<<<<<< HEAD
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
=======
    trim: true
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
<<<<<<< HEAD
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
=======
    trim: true
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
<<<<<<< HEAD
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    validate: {
      validator: function(v) {
        return /^[0-9+\-\s]+$/.test(v);
      },
      message: 'Format téléphone invalide'
    }
  },
  mobile: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[0-9+\-\s]+$/.test(v);
      },
      message: 'Format mobile invalide'
    }
  },
  address: {
    street: { 
      type: String, 
      required: [true, 'La rue est requise'],
      trim: true
    },
    city: { 
      type: String, 
      required: [true, 'La ville est requise'],
      trim: true
    },
    postalCode: { 
      type: String, 
      required: [true, 'Le code postal est requis'],
      trim: true
    },
    country: { 
      type: String, 
      default: 'France',
      trim: true
    },
    complement: {
      type: String,
      trim: true
    }
  },
  company: {
    type: String,
    trim: true,
    required: function() {
      return this.type === 'professionnel';
    }
  },
  siret: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\d{14}$/.test(v.replace(/\s/g, ''));
      },
      message: 'SIRET invalide (14 chiffres requis)'
    }
  },
  tvaIntra: {
    type: String,
    trim: true,
    uppercase: true
  },
=======
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  phone: {
    type: String,
    required: [true, 'Le téléphone est requis']
  },
  mobile: String,
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'France' }
  },
  company: String,
  siret: String,
  tvaIntra: String,
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  paymentTerms: {
    type: String,
    enum: ['comptant', '15_jours', '30_jours', '45_jours', '60_jours'],
    default: '30_jours'
  },
  creditLimit: {
    type: Number,
    default: 0,
<<<<<<< HEAD
    min: [0, 'La limite de crédit ne peut pas être négative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
=======
    min: 0
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
<<<<<<< HEAD
    required: true,
    index: true
  },
  lastOrderDate: Date,
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware pre-save pour générer le numéro client
customerSchema.pre('save', async function() {
  if (this.isNew && !this.customerNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Customer').countDocuments();
    this.customerNumber = `CLI-${year}-${String(count + 1).padStart(6, '0')}`;
  }
});

// Middleware pre-save pour nettoyer le SIRET
customerSchema.pre('save', function() {
  if (this.siret) {
    this.siret = this.siret.replace(/\s/g, '');
  }
});

// Index pour la recherche
customerSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text',
  company: 'text' 
});

// Index composés pour les requêtes fréquentes
customerSchema.index({ isActive: 1, createdAt: -1 });
customerSchema.index({ type: 1, isActive: 1 });
customerSchema.index({ 'address.city': 1, isActive: 1 });
customerSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual pour le nom complet
customerSchema.virtual('fullName').get(function() {
  if (this.type === 'professionnel' && this.company) {
    return this.company;
  }
  if (this.civility) {
    return `${this.civility} ${this.firstName} ${this.lastName}`.trim();
  }
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual pour l'adresse complète
customerSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address.street,
    this.address.complement,
    `${this.address.postalCode} ${this.address.city}`,
    this.address.country
  ].filter(Boolean);
  return parts.join(', ');
});

// Méthode pour mettre à jour les statistiques
customerSchema.methods.updateStats = async function(orderAmount) {
  this.totalOrders += 1;
  this.totalSpent += orderAmount;
  this.lastOrderDate = new Date();
  return this.save();
};

// Méthode statique pour les clients actifs
customerSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort('-createdAt');
};

// Méthode statique pour les statistiques par type
customerSchema.statics.getStatsByType = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        active: { 
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Customer', customerSchema);
=======
    required: true
  }
}, {
  timestamps: true
});

customerSchema.pre('save', async function() {
  if (this.isNew) {
    const count = await mongoose.model('Customer').countDocuments();
    const year = new Date().getFullYear();
    this.customerNumber = `CLI-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

customerSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
