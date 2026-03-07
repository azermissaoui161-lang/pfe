const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

// @desc    Inscription
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department } = req.body;

    // Vérifier si l'utilisateur existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employe',
      department
    });

    // Générer token
    const token = user.generateToken();

    // Journaliser
    await AuditLog.create({
      user: user._id,
      action: 'CREATE',
      entity: 'USER',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  console.log('🔥 LOGIN EXÉCUTÉ - req.url:', req.url);
  console.log('   req.body:', req.body);
  try {
    const { email, password } = req.body;

    // Vérifier email et mot de passe
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier si compte actif
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Compte désactivé. Contactez l\'administrateur.' 
      });
    }

    // Mettre à jour dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    // Générer token
    const token = user.generateToken();

    // Journaliser
    await AuditLog.create({
      user: user._id,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user._id,
      details: { email: user.email },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Déconnexion
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'LOGOUT',
        entity: 'USER',
        entityId: req.user._id,
        ipAddress: req.ip
      });
    }
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Récupérer profil
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour le profil (email/mot de passe)
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { newEmail, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Variables pour suivre les modifications
    let modifications = [];

    // 1. CHANGEMENT D'EMAIL
    if (newEmail && newEmail !== user.email) {
      // Vérifier si le nouvel email existe déjà
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé' 
        });
      }
      
      user.email = newEmail;
      modifications.push('email');
    }

    // 2. CHANGEMENT DE MOT DE PASSE
    if (newPassword) {
      // Vérifier que le mot de passe actuel est fourni
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Le mot de passe actuel est requis pour changer le mot de passe' 
        });
      }

      // Vérifier le mot de passe actuel
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Mot de passe actuel incorrect' 
        });
      }

      // Mettre à jour le mot de passe (le middleware pre-save le hashera)
      user.password = newPassword;
      modifications.push('mot de passe');
    }

    // Si aucune modification
    if (modifications.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucune modification demandée' 
      });
    }

    // Sauvegarder les modifications
    await user.save();

    // Générer un nouveau token (optionnel)
    const token = user.generateToken();

    // Journaliser la modification
    await AuditLog.create({
      user: user._id,
      action: 'UPDATE',
      entity: 'USER',
      entityId: user._id,
      details: { 
        modifications,
        email: user.email 
      },
      ipAddress: req.ip
    });

    res.json({ 
      success: true, 
      message: `Profil mis à jour avec succès (${modifications.join(', ')})`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department
      },
      token // Optionnel: renvoyer un nouveau token
    });

  } catch (error) {
    console.error('❌ Erreur updateProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la mise à jour du profil' 
    });
  }
};