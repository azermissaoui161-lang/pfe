const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    const modifications = [];

    // Mise à jour des champs
    if (firstName && firstName !== user.firstName) {
      user.firstName = firstName;
      modifications.push('prénom');
    }
    
    if (lastName && lastName !== user.lastName) {
      user.lastName = lastName;
      modifications.push('nom');
    }
    
    if (email && email !== user.email) {
      // Vérifier si l'email est déjà pris
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé' 
        });
      }
      user.email = email;
      modifications.push('email');
    }
    
    if (phone !== undefined) {
      user.phone = phone;
      modifications.push('téléphone');
    }
    
    if (department !== undefined) {
      user.department = department;
      modifications.push('département');
    }
    
    if (modifications.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucune modification détectée' 
      });
    }
    
    user.updatedAt = Date.now();
    await user.save();

    // Journaliser
    await AuditLog.create({
      user: user._id,
      action: 'UPDATE',
      entity: 'USER',
      entityId: user._id,
      details: { modifications },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `Profil mis à jour (${modifications.join(', ')})`,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Changer le mot de passe
// @route   POST /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mot de passe actuel et nouveau mot de passe requis' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' 
      });
    }
    
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Vérifier l'ancien mot de passe
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mot de passe actuel incorrect' 
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    // Journaliser
    await AuditLog.create({
      user: user._id,
      action: 'PASSWORD_CHANGE',
      entity: 'USER',
      entityId: user._id,
      ipAddress: req.ip
    });

    res.json({ 
      success: true, 
      message: 'Mot de passe mis à jour avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Récupérer les préférences d'un module
// @route   GET /api/users/preferences/:module
exports.getPreferences = async (req, res) => {
  try {
    const { module } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    const preferences = user.preferences?.[module] || {};
    
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Mettre à jour les préférences d'un module
// @route   PUT /api/users/preferences/:module
exports.updatePreferences = async (req, res) => {
  try {
    const { module } = req.params;
    const preferences = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Initialiser l'objet preferences s'il n'existe pas
    if (!user.preferences) user.preferences = {};
    
    // Mettre à jour les préférences du module
    user.preferences[module] = {
      ...user.preferences[module],
      ...preferences
    };
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      success: true,
      data: user.preferences[module]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};