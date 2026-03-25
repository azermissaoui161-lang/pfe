const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const AuditLog = require('../models/AuditLog');
const { createNotification } = require('./notificationController');

// @desc    Créer un produit
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { sku } = req.body;

    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'SKU déjà utilisé' });
    }

    const product = await Product.create({
      ...req.body,
      sku: sku.toUpperCase(),
      createdBy: req.user.id
    });

    await StockMovement.create({
      product: product._id,
      type: 'entrée',
      quantity: product.currentStock,
      reason: 'inventaire',
      stockBefore: 0,
      stockAfter: product.currentStock,
      notes: 'Création initiale',
      createdBy: req.user.id
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE',
      entity: 'PRODUCT',
      entityId: product._id,
      details: { sku: product.sku, name: product.name },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer tous les produits
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      supplier,
      lowStock,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (supplier) query.supplier = supplier;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$alertThreshold'] };
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer un produit par ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('supplier')
      .populate('createdBy', 'firstName lastName');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const movements = await StockMovement.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: { ...product.toObject(), recentMovements: movements } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour un produit
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const oldStock = product.currentStock;
    const updates = { ...req.body };

    // Vérifier SKU unique
    if (updates.sku && updates.sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({ 
        sku: updates.sku.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({ success: false, message: 'SKU déjà utilisé' });
      }
      updates.sku = updates.sku.toUpperCase();
    }

    Object.assign(product, updates);
    await product.save();

    // Si le stock a changé
    if (updates.currentStock !== undefined && updates.currentStock !== oldStock) {
      await StockMovement.create({
        product: product._id,
        type: updates.currentStock > oldStock ? 'entrée' : 'sortie',
        quantity: Math.abs(updates.currentStock - oldStock),
        reason: 'ajustement',
        stockBefore: oldStock,
        stockAfter: product.currentStock,
        notes: 'Mise à jour manuelle',
        createdBy: req.user.id
      });

      // Vérifier stock faible
      if (product.isLowStock()) {
        await createNotification(
          req.user.id,
          'stock_faible',
          '⚠️ Stock faible',
          `Le produit "${product.name}" a un stock critique (${product.currentStock})`,
          { productId: product._id, stock: product.currentStock }
        );
      }
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE',
      entity: 'PRODUCT',
      entityId: product._id,
      details: { sku: product.sku },
      ipAddress: req.ip
    });

    res.json({ success: true, data: product, message: 'Produit mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer un produit
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Vérifier s'il y a des mouvements de stock
    const movementCount = await StockMovement.countDocuments({ product: product._id });
    if (movementCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible: des mouvements de stock existent' 
      });
    }

    await product.deleteOne();

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE',
      entity: 'PRODUCT',
      entityId: req.params.id,
      details: { sku: product.sku, name: product.name },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour le stock
// @route   PATCH /api/products/:id/stock
exports.updateStock = async (req, res) => {
  try {
    const { quantity, type, reason, notes } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const stockBefore = product.currentStock;
    
    if (type === 'entrée') {
      product.currentStock += quantity;
    } else if (type === 'sortie') {
      if (product.currentStock < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Stock insuffisant. Disponible: ${product.currentStock}` 
        });
      }
      product.currentStock -= quantity;
    }

    await product.save();

    await StockMovement.create({
      product: product._id,
      type,
      quantity,
      reason: reason || 'ajustement',
      notes,
      stockBefore,
      stockAfter: product.currentStock,
      createdBy: req.user.id
    });

    if (product.isLowStock()) {
      await createNotification(
        req.user.id,
        'stock_faible',
        '⚠️ Stock faible',
        `Le produit "${product.name}" a un stock critique (${product.currentStock})`,
        { productId: product._id, stock: product.currentStock }
      );
    }

    res.json({ 
      success: true, 
      data: product, 
      message: 'Stock mis à jour avec succès' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};