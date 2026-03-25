const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// @desc    Créer un mouvement de stock
// @route   POST /api/stock/movements
const createStockMovement = async (req, res) => {
  try {
    const { productId, type, quantity, reason, reference, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const stockBefore = product.currentStock;
    let stockAfter = stockBefore;

    // Calculer le nouveau stock
    if (type === 'entrée') {
      stockAfter = stockBefore + quantity;
    } else if (type === 'sortie') {
      if (stockBefore < quantity) {
        return res.status(400).json({ message: 'Stock insuffisant' });
      }
      stockAfter = stockBefore - quantity;
    } else {
      // Ajustement
      stockAfter = quantity; // quantity devient le nouveau stock
    }

    // Mettre à jour le produit
    product.currentStock = stockAfter;
    await product.save();

    // Créer le mouvement
    const movement = await StockMovement.create({
      product: productId,
      type,
      quantity: type === 'ajustement' ? stockAfter - stockBefore : quantity,
      reason,
      reference,
      stockBefore,
      stockAfter,
      notes,
      createdBy: req.user._id
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      entity: 'STOCK',
      entityId: movement._id,
      details: { 
        product: product.name,
        type,
        quantity: movement.quantity,
        stockBefore,
        stockAfter
      }
    });

    res.status(201).json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer tous les mouvements
// @route   GET /api/stock/movements
const getStockMovements = async (req, res) => {
  try {
    const { productId, type, startDate, endDate } = req.query;
    const query = {};

    if (productId) query.product = productId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(query)
      .populate('product', 'name sku')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer un mouvement par ID
// @route   GET /api/stock/movements/:id
const getStockMovementById = async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id)
      .populate('product', 'name sku')
      .populate('createdBy', 'firstName lastName');
    
    if (!movement) {
      return res.status(404).json({ message: 'Mouvement non trouvé' });
    }
    
    res.json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un mouvement
// @route   PUT /api/stock/movements/:id
const updateStockMovement = async (req, res) => {
  try {
    const movement = await StockMovement.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!movement) {
      return res.status(404).json({ message: 'Mouvement non trouvé' });
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      entity: 'STOCK',
      entityId: movement._id,
      details: { product: movement.product }
    });

    res.json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un mouvement
// @route   DELETE /api/stock/movements/:id
const deleteStockMovement = async (req, res) => {
  try {
    const movement = await StockMovement.findByIdAndDelete(req.params.id);
    
    if (!movement) {
      return res.status(404).json({ message: 'Mouvement non trouvé' });
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE',
      entity: 'STOCK',
      entityId: req.params.id,
      details: { product: movement.product }
    });

    res.json({ message: 'Mouvement supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Statistiques de stock
// @route   GET /api/stock/stats
const getStockStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    const totalValue = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$purchasePrice'] } } } }
    ]);

    const lowStock = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$alertThreshold'] }
    });

    const outOfStock = await Product.countDocuments({
      isActive: true,
      currentStock: 0
    });

    res.json({
      totalProducts,
      stockValue: totalValue[0]?.total || 0,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  createStockMovement,
  getStockMovements,
  getStockMovementById,
  updateStockMovement,
  deleteStockMovement,
  getStockStats
};