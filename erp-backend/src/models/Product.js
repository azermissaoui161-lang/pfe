const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Le code SKU est requis'],
    unique: true,
    uppercase: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La catégorie est requise']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: [0, 'Le prix d\'achat ne peut pas être négatif']
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: [0, 'Le prix de vente ne peut pas être négatif']
  },
  taxRate: {
    type: Number,
    default: 20,
    enum: [0, 5.5, 10, 20]
  },
  margin: {
    type: Number,
    default: 0
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  alertThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  unit: {
    type: String,
    enum: ['pièce', 'kg', 'litre', 'mètre', 'boîte', 'palette'],
    default: 'pièce'
  },
  location: String,
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

productSchema.pre('save', function(next) {
  if (this.purchasePrice && this.sellingPrice) {
    this.margin = ((this.sellingPrice - this.purchasePrice) / this.purchasePrice) * 100;
  }
  next();
});

productSchema.index({ name: 'text', sku: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ currentStock: 1 });

productSchema.methods.isLowStock = function() {
  return this.currentStock <= this.alertThreshold;
};

module.exports = mongoose.model('Product', productSchema);