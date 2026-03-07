const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La quantité doit être au moins 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Le prix unitaire ne peut pas être négatif']
  },
  taxRate: {
    type: Number,
    default: 20,
    enum: [0, 5.5, 10, 20]
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalHT: Number,
  totalTTC: Number
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['facture', 'avoir', 'acompte'],
    default: 'facture'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [invoiceItemSchema],
  subtotalHT: {
    type: Number,
    required: true,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  totalTTC: {
    type: Number,
    required: true,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  amountDue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['brouillon', 'envoyée', 'payée', 'partiellement_payée', 'en_retard', 'annulée'],
    default: 'brouillon'
  },
  paymentMethod: String,
  paidAt: Date,
  notes: String,
  termsAndConditions: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: Date
}, {
  timestamps: true
});

invoiceSchema.pre('save', async function() {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `FACT-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
});

invoiceSchema.pre('save', function(next) {
  let subtotalHT = 0;
  let totalTax = 0;
  
  this.items.forEach(item => {
    const itemHT = item.quantity * item.unitPrice * (1 - item.discount / 100);
    const itemTax = itemHT * (item.taxRate / 100);
    
    item.totalHT = itemHT;
    item.totalTTC = itemHT + itemTax;
    
    subtotalHT += itemHT;
    totalTax += itemTax;
  });
  
  this.subtotalHT = subtotalHT;
  this.totalTax = totalTax;
  this.totalTTC = subtotalHT + totalTax;
  this.amountDue = this.totalTTC - this.amountPaid;
  
  next();
});

invoiceSchema.index({ customer: 1, date: -1 });
invoiceSchema.index({ status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
