const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  category: { 
    type: String, 
    required: true,
    trim: true
  },
  stock: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  supplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: true,
    index: true
  },
  minStock: { 
    type: Number, 
    default: 5,
    min: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ supplierId: 1, createdAt: -1 });

// Middleware pre-save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual pour le statut
productSchema.virtual('status').get(function() {
  if (this.stock === 0) return 'rupture';
  if (this.stock < this.minStock) return 'stock faible';
  return 'en stock';
});

// Méthode utilitaire
productSchema.methods.updateStock = function(quantity) {
  this.stock += quantity;
  return this.save();
};

// Méthode statique pour les alertes
productSchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$stock', '$minStock'] }
  }).populate('supplierId', 'name email');
};

module.exports = mongoose.model('Product', productSchema);