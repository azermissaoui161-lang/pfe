const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/accounts
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/accounts/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Créer un utilisateur
// @route   POST /api/accounts
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      phone,
      createdBy: req.user.id
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE',
      entity: 'USER',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip
    });

    res.status(201).json({ 
      success: true, 
      data: user.select('-password'),
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/accounts/:id
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, department, phone, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Vérifier email unique
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
      }
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    user.phone = phone || user.phone;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE',
      entity: 'USER',
      entityId: user._id,
      details: { email: user.email },
      ipAddress: req.ip
    });

    res.json({ 
      success: true, 
      data: user.select('-password'),
      message: 'Utilisateur mis à jour'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/accounts/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (user.role === 'admin_principal') {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de supprimer un administrateur principal' 
      });
    }

    await user.deleteOne();

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE',
      entity: 'USER',
      entityId: req.params.id,
      details: { email: user.email },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activer/Désactiver un utilisateur
// @route   PATCH /api/accounts/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE',
      entity: 'USER',
      entityId: user._id,
      details: { isActive: user.isActive },
      ipAddress: req.ip
    });

    res.json({ 
      success: true, 
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};