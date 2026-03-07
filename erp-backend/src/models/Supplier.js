const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du fournisseur est requis'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Le téléphone est requis']
  },
  address: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  taxId: {
    type: String,
    unique: true,
    sparse: true
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  paymentTerms: {
    type: String,
    default: '30 jours'
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);