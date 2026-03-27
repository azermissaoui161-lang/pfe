// src/controllers/dashboardStockController.js
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

// @desc    Dashboard stock principal
// @route   GET /api/dashboard/stock
const getStockDashboard = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ==================== STATISTIQUES GÉNÉRALES ====================
    const stockStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          totalSellingValue: { $sum: { $multiply: ['$stock', '$price'] } },
          totalItems: { $sum: '$stock' },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$stock', 0] },
                  { $lt: ['$stock', '$minStock'] }
                ]},
                1,
                0
              ]
            }
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // ==================== PRODUITS PAR CATÉGORIE ====================
    const productsByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          totalItems: { $sum: '$stock' }
        }
      },
      {
        $project: {
          categoryName: '$_id',
          count: 1,
          totalValue: 1,
          totalItems: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // ==================== PRODUITS EN STOCK FAIBLE ====================
    const lowStockProducts = await Product.find({
      $expr: {
        $and: [
          { $gt: ['$stock', 0] },
          { $lt: ['$stock', '$minStock'] }
        ]
      }
    })
    .populate('supplierId', 'name phone email')
    .select('name sku stock minStock price supplierId')
    .limit(20);

    // ==================== PRODUITS EN RUPTURE ====================
    const outOfStockProducts = await Product.find({ stock: 0, isActive: true })
      .populate('supplierId', 'name phone email')
      .select('name sku price supplierId')
      .limit(20);

    // ==================== MOUVEMENTS RÉCENTS ====================
    const recentMovements = await StockMovement.find()
      .populate('product', 'name sku')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(20);

    // ==================== STATISTIQUES DES MOUVEMENTS ====================
    const movementStats = await StockMovement.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Entrées/Sorties par jour (30 derniers jours)
    const dailyMovements = await StockMovement.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          quantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // ==================== TOP PRODUITS (ENTRÉES/SORTIES) ====================
    const topInProducts = await StockMovement.aggregate([
      { $match: { type: 'entrée' } },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          lastMovement: { $max: '$createdAt' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productId: '$_id',
          productName: '$productInfo.name',
          sku: '$productInfo.sku',
          totalQuantity: 1,
          lastMovement: 1
        }
      }
    ]);

    const topOutProducts = await StockMovement.aggregate([
      { $match: { type: 'sortie' } },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          lastMovement: { $max: '$createdAt' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productId: '$_id',
          productName: '$productInfo.name',
          sku: '$productInfo.sku',
          totalQuantity: 1,
          lastMovement: 1
        }
      }
    ]);

    // ==================== PRODUITS LES PLUS RÉCEMMENT AJOUTÉS ====================
    const recentlyAdded = await Product.find({ isActive: true })
      .populate('supplierId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name sku stock price supplierId createdAt');

    // ==================== STATISTIQUES FOURNISSEURS ====================
    const supplierStats = await Supplier.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'supplierId',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          productCount: { $size: '$products' },
          totalValue: {
            $sum: {
              $map: {
                input: '$products',
                as: 'product',
                in: { $multiply: ['$$product.stock', '$$product.price'] }
              }
            }
          }
        }
      },
      { $match: { productCount: { $gt: 0 } } },
      { $sort: { productCount: -1 } },
      { $limit: 5 }
    ]);

    // ==================== VALEUR TOTALE DU STOCK PAR FOURNISSEUR ====================
    const valueBySupplier = await Product.aggregate([
      { $match: { isActive: true, supplierId: { $ne: null } } },
      {
        $group: {
          _id: '$supplierId',
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          productCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      { $unwind: '$supplierInfo' },
      {
        $project: {
          supplierName: '$supplierInfo.name',
          totalValue: 1,
          productCount: 1
        }
      }
    ]);

    // ==================== VALEUR DU STOCK PAR CATÉGORIE ====================
    const valueByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          productCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 5 },
      {
        $project: {
          categoryName: '$_id',
          totalValue: 1,
          productCount: 1
        }
      }
    ]);

    // ==================== ALERTES ====================
    const alerts = [];

    // Alerte stock faible
    if (stockStats[0]?.lowStock > 0) {
      alerts.push({
        type: 'warning',
        message: `${stockStats[0].lowStock} produit(s) en stock faible`,
        details: 'Seuil d\'alerte dépassé',
        products: lowStockProducts.map(p => ({
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          minStock: p.minStock,
          supplier: p.supplierId?.name
        }))
      });
    }

    // Alerte rupture
    if (stockStats[0]?.outOfStock > 0) {
      alerts.push({
        type: 'danger',
        message: `${stockStats[0].outOfStock} produit(s) en rupture de stock`,
        details: 'Réapprovisionnement nécessaire',
        products: outOfStockProducts.map(p => ({
          name: p.name,
          sku: p.sku,
          supplier: p.supplierId?.name
        }))
      });
    }

    // Alerte produits sans catégorie
    const uncategorizedCount = await Product.countDocuments({ 
      category: null, 
      isActive: true 
    });
    if (uncategorizedCount > 0) {
      alerts.push({
        type: 'info',
        message: `${uncategorizedCount} produit(s) sans catégorie`,
        details: 'Affectez une catégorie pour une meilleure gestion'
      });
    }

    // ==================== RÉPONSE FINALE ====================
    res.json({
      success: true,
      data: {
        overview: {
          totalProducts: stockStats[0]?.totalProducts || 0,
          totalValue: stockStats[0]?.totalValue || 0,
          totalSellingValue: stockStats[0]?.totalSellingValue || 0,
          totalItems: stockStats[0]?.totalItems || 0,
          lowStock: stockStats[0]?.lowStock || 0,
          outOfStock: stockStats[0]?.outOfStock || 0
        },
        categories: {
          distribution: productsByCategory,
          valueByCategory
        },
        movements: {
          recent: recentMovements,
          stats: {
            entries: movementStats.find(m => m._id === 'entrée') || { count: 0, totalQuantity: 0 },
            exits: movementStats.find(m => m._id === 'sortie') || { count: 0, totalQuantity: 0 },
            adjustments: movementStats.find(m => m._id === 'ajustement') || { count: 0, totalQuantity: 0 },
            daily: dailyMovements
          }
        },
        products: {
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          recentlyAdded,
          topIn: topInProducts,
          topOut: topOutProducts
        },
        suppliers: {
          stats: supplierStats,
          valueBySupplier
        },
        alerts,
        department: 'stock',
        adminName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Erreur dashboard stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Récupérer les mouvements de stock
// @route   GET /api/dashboard/stock/movements
const getMovements = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, productId, startDate, endDate } = req.query;
    const query = {};

    if (type) query.type = type;
    if (productId) query.product = productId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(query)
      .populate('product', 'name sku')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await StockMovement.countDocuments(query);

    res.json({
      success: true,
      data: movements,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération mouvements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// @desc    Récupérer les produits en stock faible
// @route   GET /api/dashboard/stock/low-stock
const getLowStock = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $and: [
          { $gt: ['$stock', 0] },
          { $lt: ['$stock', '$minStock'] }
        ]
      }
    })
    .populate('supplierId', 'name phone email')
    .sort({ stock: 1 });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Erreur récupération stock faible:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

module.exports = {
  getStockDashboard,
  getMovements,
  getLowStock
};