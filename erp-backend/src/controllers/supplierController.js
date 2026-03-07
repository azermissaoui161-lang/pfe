const Supplier = require('../models/Supplier');
const AuditLog = require('../models/AuditLog');

// @desc    Créer un fournisseur
// @route   POST /api/suppliers
const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, taxId, contactPerson, paymentTerms, notes } = req.body;

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      taxId,
      contactPerson,
      paymentTerms,
      notes,
      createdBy: req.user._id
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      entity: 'SUPPLIER',
      entityId: supplier._id,
      details: { name: supplier.name }
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer tous les fournisseurs
// @route   GET /api/suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer un fournisseur par ID
// @route   GET /api/suppliers/:id
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un fournisseur
// @route   PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    supplier.name = req.body.name || supplier.name;
    supplier.email = req.body.email || supplier.email;
    supplier.phone = req.body.phone || supplier.phone;
    supplier.address = req.body.address || supplier.address;
    supplier.taxId = req.body.taxId || supplier.taxId;
    supplier.contactPerson = req.body.contactPerson || supplier.contactPerson;
    supplier.paymentTerms = req.body.paymentTerms || supplier.paymentTerms;
    supplier.notes = req.body.notes || supplier.notes;

    await supplier.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      entity: 'SUPPLIER',
      entityId: supplier._id,
      details: { name: supplier.name }
    });

    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un fournisseur
// @route   DELETE /api/suppliers/:id
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    await supplier.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE',
      entity: 'SUPPLIER',
      entityId: req.params.id,
      details: { name: supplier.name }
    });

    res.json({ message: 'Fournisseur supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Statistiques des fournisseurs
// @route   GET /api/suppliers/stats
const getSupplierStats = async (req, res) => {
  try {
    const total = await Supplier.countDocuments();
    const active = await Supplier.countDocuments({ isActive: true });
    
    res.json({
      total,
      active,
      inactive: total - active
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierStats
};