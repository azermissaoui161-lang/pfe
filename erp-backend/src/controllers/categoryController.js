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
    ]);

    res.json({
      success: true,
      data: { total, active, inactive: total - active, topCategories }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};