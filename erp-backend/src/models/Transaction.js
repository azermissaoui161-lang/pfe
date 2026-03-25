const mongoose = require('mongoose');

const transactionEntrySchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  label: String
});

const transactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  entries: [transactionEntrySchema],
  totalDebit: {
    type: Number,
    required: true,
    default: 0
  },
  totalCredit: {
    type: Number,
    required: true,
    default: 0
  },
  reference: String,
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Invoice', 'Order', 'Payment']
  },
  status: {
    type: String,
    enum: ['brouillon', 'validé', 'annulé'],
    default: 'brouillon'
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

transactionSchema.pre('save', function() {
  if (this.totalDebit !== this.totalCredit) {
    throw new Error('Le total des débits doit être égal au total des crédits');
  }
});

transactionSchema.pre('save', async function() {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Transaction').countDocuments();
    this.transactionNumber = `ECR-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
