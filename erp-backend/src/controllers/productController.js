<<<<<<< HEAD
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');
const StockMovement = require('../models/StockMovement');

/**
 * Formatter un produit pour le frontend
 * @param {Object} product - Produit MongoDB
 * @returns {Object} Produit formaté
 */
const formatProduct = (product) => ({
  id: product._id,
  name: product.name,
  category: product.category,
  stock: product.stock,
  price: product.price,
  status: product.status, // Utilise le virtual
  supplierId: product.supplierId?._id || product.supplierId,
  supplier: product.supplierId ? {
    id: product.supplierId._id,
    name: product.supplierId.name,
    email: product.supplierId.email,
    phone: product.supplierId.phone,
    rating: product.supplierId.rating
  } : null,
  minStock: product.minStock,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

/**
 * Gérer les erreurs de manière sécurisée
 * @param {Error} error - Erreur catchée
 * @param {Response} res - Express response
 * @param {string} defaultMessage - Message par défaut
 */
const handleError = (error, res, defaultMessage = 'Erreur serveur') => {
  console.error(`❌ ${defaultMessage}:`, error);
  
  // En production, ne pas exposer les détails techniques
  const message = process.env.NODE_ENV === 'production' 
    ? defaultMessage 
    : error.message;
  
  res.status(500).json({ message });
};

// ===== GET /api/products =====
exports.getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category, 
      status,
      search 
    } = req.query;

    // Construire le filtre
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exécuter les requêtes en parallèle
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('supplierId', 'name email phone rating')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // lean() pour meilleures performances
      
      Product.countDocuments(filter)
    ]);

    // Formater les produits
    const formattedProducts = products.map(formatProduct);
    
    res.json({
      products: formattedProducts,
=======
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
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
<<<<<<< HEAD
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des produits');
  }
};

// ===== GET /api/products/:id =====
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation de l'ID MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID produit invalide' });
    }

    // Récupérer le produit avec ses relations
    const product = await Product.findById(id)
      .populate('supplierId')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Récupérer les mouvements récents
    const movements = await StockMovement.find({ productId: product._id })
      .sort('-date')
      .limit(50)
      .lean();

    // Statistiques du produit
    const stats = {
      totalEntries: movements
        .filter(m => m.type === 'entrée')
        .reduce((sum, m) => sum + m.quantity, 0),
      totalExits: movements
        .filter(m => m.type === 'sortie')
        .reduce((sum, m) => sum + m.quantity, 0),
      lastMovement: movements[0] || null
    };

    res.json({
      product: formatProduct(product),
      movements: movements.map(m => ({
        id: m._id,
        date: m.date.toISOString().split('T')[0],
        product: m.product,
        productId: m.productId,
        type: m.type,
        quantity: m.quantity,
        user: m.user,
        note: m.note,
        reason: m.reason
      })),
      stats
    });
    
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération du produit');
  }
};

// ===== POST /api/products =====
exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { name, category, stock, price, supplierId, minStock = 5 } = req.body;

    // Validations
    if (!name || !category || !supplierId) {
      return res.status(400).json({ 
        message: 'Nom, catégorie et fournisseur sont requis' 
      });
    }

    // Vérifier si le fournisseur existe
    const supplier = await Supplier.findById(supplierId).session(session);
    if (!supplier) {
      throw new Error('Fournisseur non trouvé');
    }

    // Vérifier si le produit existe déjà
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      supplierId 
    }).session(session);
    
    if (existingProduct) {
      throw new Error('Un produit avec ce nom existe déjà pour ce fournisseur');
    }

    // Créer le produit
    const product = new Product({
      name: name.trim(),
      category: category.trim(),
      stock: parseInt(stock) || 0,
      price: parseFloat(price) || 0,
      supplierId,
      minStock: parseInt(minStock) || 5,
      createdBy: req.user?._id
    });

    await product.save({ session });

    // Mettre à jour ou créer la catégorie
    let categoryDoc = await Category.findOne({ name: category }).session(session);
    if (!categoryDoc) {
      categoryDoc = new Category({ 
        name: category.trim(), 
        description: '' 
      });
    } else {
      categoryDoc.productCount += 1;
    }
    await categoryDoc.save({ session });

    // Mettre à jour le fournisseur
    supplier.products = (supplier.products || 0) + 1;
    await supplier.save({ session });

    // Créer un mouvement pour le stock initial
    if (product.stock > 0) {
      const movement = new StockMovement({
        productId: product._id,
        product: product.name,
        type: 'entrée',
        quantity: product.stock,
        user: req.user?.email || 'system',
        note: 'Stock initial',
        reason: 'initial',
        createdBy: req.user?._id
      });
      await movement.save({ session });
    }

    await session.commitTransaction();

    // Récupérer le produit avec ses relations
    const populatedProduct = await Product.findById(product._id)
      .populate('supplierId', 'name email phone rating')
      .lean();

    res.status(201).json(formatProduct(populatedProduct));
    
  } catch (error) {
    await session.abortTransaction();
    
    // Gérer les erreurs de validation
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(400).json({ message: error.message });
    
  } finally {
    session.endSession();
  }
};

// ===== PUT /api/products/:id =====
exports.update = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID produit invalide' });
    }

    // Récupérer le produit
    const product = await Product.findById(id).session(session);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const oldCategory = product.category;
    const oldSupplierId = product.supplierId.toString();
    const oldStock = product.stock;

    // Mettre à jour les champs
    const updatedFields = {};

    if (updates.name && updates.name !== product.name) {
      // Vérifier l'unicité du nom
      const existing = await Product.findOne({
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        supplierId: product.supplierId,
        _id: { $ne: id }
      }).session(session);
      
      if (existing) {
        throw new Error('Un produit avec ce nom existe déjà pour ce fournisseur');
      }
      
      product.name = updates.name.trim();
      updatedFields.name = true;
    }

    if (updates.price !== undefined) {
      product.price = parseFloat(updates.price) || 0;
      updatedFields.price = true;
    }

    // Gestion du stock
    if (updates.stock !== undefined) {
      const newStock = parseInt(updates.stock) || 0;
      const difference = newStock - product.stock;
      
      if (difference !== 0) {
        // Créer un mouvement pour l'ajustement
        const movement = new StockMovement({
          productId: product._id,
          product: product.name,
          type: difference > 0 ? 'entrée' : 'sortie',
          quantity: Math.abs(difference),
          user: req.user?.email || 'system',
          note: updates.note || 'Ajustement manuel',
          reason: 'adjustment',
          createdBy: req.user?._id
        });
        await movement.save({ session });
      }
      
      product.stock = newStock;
      updatedFields.stock = true;
    }

    if (updates.minStock !== undefined) {
      product.minStock = parseInt(updates.minStock) || 5;
      updatedFields.minStock = true;
    }

    // Gestion du changement de catégorie
    if (updates.category && updates.category !== product.category) {
      product.category = updates.category.trim();
      updatedFields.category = true;

      // Mettre à jour l'ancienne catégorie
      const oldCat = await Category.findOne({ name: oldCategory }).session(session);
      if (oldCat) {
        oldCat.productCount = Math.max(0, (oldCat.productCount || 0) - 1);
        await oldCat.save({ session });
      }

      // Mettre à jour la nouvelle catégorie
      let newCat = await Category.findOne({ name: updates.category }).session(session);
      if (!newCat) {
        newCat = new Category({ name: updates.category.trim(), description: '' });
      } else {
        newCat.productCount = (newCat.productCount || 0) + 1;
      }
      await newCat.save({ session });
    }

    // Gestion du changement de fournisseur
    if (updates.supplierId && updates.supplierId !== oldSupplierId) {
      // Vérifier le nouveau fournisseur
      const newSupplier = await Supplier.findById(updates.supplierId).session(session);
      if (!newSupplier) {
        throw new Error('Nouveau fournisseur non trouvé');
      }

      product.supplierId = updates.supplierId;
      updatedFields.supplierId = true;

      // Mettre à jour l'ancien fournisseur
      const oldSupp = await Supplier.findById(oldSupplierId).session(session);
      if (oldSupp) {
        oldSupp.products = Math.max(0, (oldSupp.products || 0) - 1);
        await oldSupp.save({ session });
      }

      // Mettre à jour le nouveau fournisseur
      newSupplier.products = (newSupplier.products || 0) + 1;
      await newSupplier.save({ session });
    }

    product.updatedAt = Date.now();
    product.updatedBy = req.user?._id;
    await product.save({ session });

    await session.commitTransaction();

    // Récupérer le produit mis à jour
    const updatedProduct = await Product.findById(id)
      .populate('supplierId', 'name email phone rating')
      .lean();

    res.json({
      ...formatProduct(updatedProduct),
      updated: Object.keys(updatedFields)
    });
    
  } catch (error) {
    await session.abortTransaction();
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(400).json({ message: error.message });
    
  } finally {
    session.endSession();
  }
};

// ===== DELETE /api/products/:id =====
exports.delete = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID produit invalide' });
    }

    const product = await Product.findById(id).session(session);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Vérifier s'il y a des mouvements récents (moins de 24h)
    const recentMovements = await StockMovement.findOne({
      productId: id,
      date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).session(session);

    if (recentMovements) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer un produit avec des mouvements récents' 
      });
    }

    // Mettre à jour la catégorie
    const category = await Category.findOne({ name: product.category }).session(session);
    if (category) {
      category.productCount = Math.max(0, (category.productCount || 0) - 1);
      await category.save({ session });
    }

    // Mettre à jour le fournisseur
    const supplier = await Supplier.findById(product.supplierId).session(session);
    if (supplier) {
      supplier.products = Math.max(0, (supplier.products || 0) - 1);
      await supplier.save({ session });
    }

    // Archiver les mouvements au lieu de les supprimer
    await StockMovement.updateMany(
      { productId: id },
      { 
        $set: { 
          archived: true,
          archivedAt: new Date(),
          archivedBy: req.user?._id
        }
      },
      { session }
    );

    // Soft delete du produit
    product.deletedAt = new Date();
    product.deletedBy = req.user?._id;
    product.status = 'deleted';
    await product.save({ session });

    await session.commitTransaction();

    res.json({ 
      message: 'Produit supprimé avec succès',
      id: product._id
    });
    
  } catch (error) {
    await session.abortTransaction();
    handleError(error, res, 'Erreur lors de la suppression du produit');
    
  } finally {
    session.endSession();
  }
};

// ===== GET /api/products/stock/alert =====
exports.getLowStock = async (req, res) => {
  try {
    const { threshold } = req.query;
    
    // Filtrer les produits en dessous du seuil
    const filter = {
      $expr: { $lte: ['$stock', { $ifNull: ['$minStock', threshold || 10] }] },
      deletedAt: null // Exclure les produits supprimés
    };

    const products = await Product.find(filter)
      .populate('supplierId', 'name email phone')
      .sort('stock')
      .lean();

    // Statistiques globales
    const stats = {
      total: products.length,
      critical: products.filter(p => p.stock === 0).length,
      warning: products.filter(p => p.stock > 0 && p.stock < (p.minStock || 10)).length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    };

    res.json({
      alerts: products.map(p => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        minStock: p.minStock || 10,
        supplier: p.supplierId?.name,
        supplierContact: p.supplierId?.email,
        status: p.stock === 0 ? 'rupture' : 'stock faible',
        value: p.price * p.stock
      })),
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des alertes');
  }
};

// ===== PATCH /api/products/:id/stock =====
exports.updateStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { quantity, reason = 'adjustment', note } = req.body;

    if (!quantity || quantity === 0) {
      return res.status(400).json({ message: 'Quantité requise' });
    }

    const product = await Product.findById(id).session(session);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return res.status(400).json({ 
        message: 'Stock insuffisant',
        currentStock: product.stock,
        requested: quantity
      });
    }

    // Créer le mouvement
    const movement = new StockMovement({
      productId: product._id,
      product: product.name,
      type: quantity > 0 ? 'entrée' : 'sortie',
      quantity: Math.abs(quantity),
      user: req.user?.email || 'system',
      note: note || `Ajustement de stock (${reason})`,
      reason,
      createdBy: req.user?._id
    });
    await movement.save({ session });

    // Mettre à jour le stock
    product.stock = newStock;
    product.updatedAt = Date.now();
    product.updatedBy = req.user?._id;
    await product.save({ session });

    await session.commitTransaction();

    res.json({
      product: {
        id: product._id,
        name: product.name,
        stock: product.stock,
        status: product.status
      },
      movement: {
        id: movement._id,
        type: movement.type,
        quantity: movement.quantity,
        date: movement.date
      }
    });
    
  } catch (error) {
    await session.abortTransaction();
    handleError(error, res, 'Erreur lors de la mise à jour du stock');
    
  } finally {
    session.endSession();
  }
};

// ===== PUT /api/products/update-category =====
exports.updateCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
      return res.status(400).json({ 
        message: 'Ancien et nouveau nom de catégorie requis' 
      });
    }

    // Mettre à jour tous les produits
    const result = await Product.updateMany(
      { category: oldName },
      { $set: { category: newName } },
      { session }
    );

    // Mettre à jour la catégorie
    let category = await Category.findOne({ name: oldName }).session(session);
    if (category) {
      category.name = newName;
      await category.save({ session });
    }

    await session.commitTransaction();

    res.json({
      message: 'Catégories mises à jour',
      modifiedCount: result.modifiedCount,
      oldName,
      newName
    });
    
  } catch (error) {
    await session.abortTransaction();
    handleError(error, res, 'Erreur lors de la mise à jour des catégories');
    
  } finally {
    session.endSession();
  }
};

// ===== GET /api/products/search =====
exports.search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Le paramètre q est requis' });
    }

    const filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ],
      deletedAt: null
    };

    const products = await Product.find(filter)
      .populate('supplierId', 'name email phone rating')
      .sort('-createdAt')
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: products.map(formatProduct)
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la recherche des produits');
  }
};

// ===== GET /api/products/stats =====
exports.getStats = async (req, res) => {
  try {
    const [totalProducts, totalValue, lowStock, outOfStock] = await Promise.all([
      Product.countDocuments({ deletedAt: null }),
      Product.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
      ]),
      Product.countDocuments({ 
        stock: { $gt: 0, $lt: 10 },
        deletedAt: null 
      }),
      Product.countDocuments({ 
        stock: 0,
        deletedAt: null 
      })
    ]);

    res.json({
      totalProducts,
      totalValue: totalValue[0]?.total || 0,
      lowStock,
      outOfStock,
      healthy: totalProducts - lowStock - outOfStock,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des statistiques');
=======
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
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  }
};