<<<<<<< HEAD
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * Formatter une catégorie pour le frontend
 */
const formatCategory = (category) => ({
  id: category._id,
  name: category.name,
  description: category.description || '',
  productCount: category.productCount || 0
});

/**
 * Gérer les erreurs de manière sécurisée
 */
const handleError = (error, res, defaultMessage = 'Erreur serveur') => {
  console.error(`❌ ${defaultMessage}:`, error);
  
  const message = process.env.NODE_ENV === 'production' 
    ? defaultMessage 
    : error.message;
  
  res.status(500).json({ message });
};

// ===== GET /api/categories =====
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    // Construire le filtre
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exécuter en parallèle
    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort('name')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Category.countDocuments(filter)
    ]);
    
    res.json({
      categories: categories.map(formatCategory),
=======
const Category = require('../models/Category');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// @desc    Créer une catégorie
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }

    const category = await Category.create({
      name,
      description,
      createdBy: req.user.id
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE',
      entity: 'CATEGORY',
      entityId: category._id,
      details: { name: category.name },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Catégorie créée avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer toutes les catégories
// @route   GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    let query = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('createdBy', 'firstName lastName');

    const total = await Category.countDocuments(query);

    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category._id });
        return { ...category.toObject(), productCount };
      })
    );

    res.json({
      success: true,
      data: categoriesWithProductCount,
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
    handleError(error, res, 'Erreur lors de la récupération des catégories');
  }
};

// ===== GET /api/categories/:id =====
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID catégorie invalide' });
    }

    const category = await Category.findById(id).lean();
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Récupérer les produits de cette catégorie
    const products = await Product.find({ category: category.name })
      .populate('supplierId', 'name email phone')
      .sort('-createdAt')
      .limit(100)
      .lean();
    
    // Statistiques des produits
    const productStats = {
      total: products.length,
      inStock: products.filter(p => p.stock > 0).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    };
    
    res.json({
      ...formatCategory(category),
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        price: p.price,
        status: p.status,
        supplier: p.supplierId ? {
          id: p.supplierId._id,
          name: p.supplierId.name
        } : null
      })),
      stats: productStats
    });
    
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération de la catégorie');
  }
};

// ===== POST /api/categories =====
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    // Vérifier si la catégorie existe déjà
    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim() || '',
      productCount: 0
    });
    
    await category.save();
    
    res.status(201).json(formatCategory(category));
    
  } catch (error) {
    // Gérer les erreurs de validation MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    if (error.code === 11000) { // Duplicate key
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
    }
    handleError(error, res, 'Erreur lors de la création de la catégorie');
  }
};

// ===== PUT /api/categories/:id =====
exports.update = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validation ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID catégorie invalide' });
    }

    const category = await Category.findById(id).session(session);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    const oldName = category.name;
    
    // Vérifier l'unicité du nouveau nom
    if (name && name !== oldName) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      }).session(session);
      
      if (existing) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
      }
      
      category.name = name.trim();
      
      // Mettre à jour tous les produits avec cette catégorie
      await Product.updateMany(
        { category: oldName },
        { $set: { category: name.trim() } },
        { session }
      );
    }
    
    if (description !== undefined) {
      category.description = description?.trim() || '';
    }
    
    category.updatedAt = Date.now();
    await category.save({ session });
    
    await session.commitTransaction();
    
    // Récupérer la catégorie mise à jour
    const updatedCategory = await Category.findById(id).lean();
    res.json(formatCategory(updatedCategory));
    
  } catch (error) {
    await session.abortTransaction();
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    handleError(error, res, 'Erreur lors de la modification de la catégorie');
    
  } finally {
    session.endSession();
  }
};

// ===== DELETE /api/categories/:id =====
exports.delete = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;

    // Validation ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID catégorie invalide' });
    }

    const category = await Category.findById(id).session(session);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    if (category.productCount > 0) {
      // Option 1: Empêcher la suppression
      return res.status(400).json({ 
        message: 'Impossible de supprimer une catégorie qui contient des produits',
        productCount: category.productCount
      });
      
      // Option 2: Décommenter pour déplacer les produits vers "Non catégorisé"
      // await Product.updateMany(
      //   { category: category.name },
      //   { $set: { category: 'Non catégorisé' } },
      //   { session }
      // );
    }
    
    // Vérifier si la catégorie est utilisée dans des produits archivés
    const archivedProducts = await Product.countDocuments({
      category: category.name,
      deletedAt: { $ne: null }
    }).session(session);
    
    if (archivedProducts > 0) {
      console.log(`ℹ️ ${archivedProducts} produits archivés utilisent cette catégorie`);
    }
    
    await category.deleteOne({ session });
    
    await session.commitTransaction();
    
    res.json({ 
      message: 'Catégorie supprimée avec succès',
      id: category._id,
      name: category.name
    });
    
  } catch (error) {
    await session.abortTransaction();
    handleError(error, res, 'Erreur lors de la suppression de la catégorie');
    
  } finally {
    session.endSession();
  }
};

// ===== GET /api/categories/:id/products =====
exports.getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID catégorie invalide' });
    }

    const category = await Category.findById(id).lean();
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find({ category: category.name, deletedAt: null })
        .populate('supplierId', 'name email phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments({ category: category.name, deletedAt: null })
=======
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer une catégorie par ID
// @route   GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!category) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    const products = await Product.find({ category: category._id })
      .select('name sku currentStock sellingPrice');

    res.json({ success: true, data: { ...category.toObject(), products } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour une catégorie
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp('^' + name + '$', 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Nom déjà utilisé' });
      }
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.status = status || category.status;
    await category.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE',
      entity: 'CATEGORY',
      entityId: category._id,
      details: { name: category.name },
      ipAddress: req.ip
    });

    res.json({ success: true, data: category, message: 'Catégorie mise à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer une catégorie
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Impossible: ${productCount} produit(s) associé(s)` 
      });
    }

    await category.deleteOne();

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE',
      entity: 'CATEGORY',
      entityId: req.params.id,
      details: { name: category.name },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Statistiques des catégories
// @route   GET /api/categories/stats
exports.getCategoryStats = async (req, res) => {
  try {
    const total = await Category.countDocuments();
    const active = await Category.countDocuments({ status: 'active' });
    
    const topCategories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          productCount: { $size: '$products' }
        }
      },
      { $sort: { productCount: -1 } },
      { $limit: 5 }
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    ]);

    res.json({
      success: true,
<<<<<<< HEAD
      data: products.map(p => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        price: p.price,
        status: p.status,
        minStock: p.minStock,
        supplier: p.supplierId ? {
          id: p.supplierId._id,
          name: p.supplierId.name
        } : null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des produits de la catégorie');
  }
};

// ===== GET /api/categories/stats =====
exports.getStats = async (req, res) => {
  try {
    const stats = await Category.aggregate([
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          totalProducts: { $sum: '$productCount' },
          avgProductsPerCategory: { $avg: '$productCount' },
          maxProducts: { $max: '$productCount' },
          emptyCategories: { $sum: { $cond: [{ $eq: ['$productCount', 0] }, 1, 0] } }
        }
      }
    ]);

    const topCategories = await Category.find()
      .sort('-productCount')
      .limit(5)
      .lean();

    res.json({
      global: stats[0] || {
        totalCategories: 0,
        totalProducts: 0,
        avgProductsPerCategory: 0,
        maxProducts: 0,
        emptyCategories: 0
      },
      topCategories: topCategories.map(formatCategory)
    });
    
  } catch (error) {
    handleError(error, res, 'Erreur lors de la récupération des statistiques');
=======
      data: { total, active, inactive: total - active, topCategories }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  }
};