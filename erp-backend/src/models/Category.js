const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
<<<<<<< HEAD
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: 200
  },
  productCount: { 
    type: Number, 
    default: 0,
    min: 0
  }
}, {
  timestamps: true, // Ajoute createdAt et updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour la recherche
categorySchema.index({ name: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Méthode pour mettre à jour le compteur
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  this.productCount = await Product.countDocuments({ category: this.name });
  await this.save();
  return this.productCount;
};

// Méthode statique pour mettre à jour les compteurs après changement
categorySchema.statics.updateCounts = async function(oldName, newName) {
  if (oldName !== newName) {
    await Promise.all([
      this.findOneAndUpdate(
        { name: oldName },
        { $inc: { productCount: -1 } }
      ),
      this.findOneAndUpdate(
        { name: newName },
        { $inc: { productCount: 1 } }
      )
    ]);
  }
};

// Virtual pour savoir si la catégorie est vide
categorySchema.virtual('isEmpty').get(function() {
  return this.productCount === 0;
});

=======
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    unique: true,
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

categorySchema.index({ name: 'text', description: 'text' });

>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
module.exports = mongoose.model('Category', categorySchema);