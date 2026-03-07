const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['entrée', 'sortie', 'ajustement'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['achat', 'vente', 'inventaire', 'retour', 'transfert'],
    required: true
  },
  reference: String,
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Order', 'Invoice']
  },
  stockBefore: {
    type: Number,
    required: true
  },
  stockAfter: {
    type: Number,
    required: true
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

stockMovementSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);