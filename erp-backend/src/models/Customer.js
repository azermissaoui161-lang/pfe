const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['particulier', 'professionnel'],
    default: 'particulier'
  },
  civility: {
    type: String,
    enum: ['M.', 'Mme', 'Mlle', 'Société'],
    default: 'M.'
  },
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
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
  paymentTerms: {
    type: String,
    enum: ['comptant', '15_jours', '30_jours', '45_jours', '60_jours'],
    default: '30_jours'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
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

customerSchema.pre('save', async function() {
  if (this.isNew) {
    const count = await mongoose.model('Customer').countDocuments();
    const year = new Date().getFullYear();
    this.customerNumber = `CLI-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

customerSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
