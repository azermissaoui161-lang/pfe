// src/controllers/notificationController.js
const Notification = require('../models/Notification');

<<<<<<< HEAD
// Fonction utilitaire pour créer une notification
=======
// Définir les fonctions comme des constantes
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
const createNotification = async (userId, type, title, message, data = {}, priority = 'moyenne') => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
<<<<<<< HEAD
      priority,
      read: false
=======
      priority
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    });
    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
    return null;
  }
};

<<<<<<< HEAD
// GET /api/notifications - Récupérer les notifications de l'utilisateur
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read } = req.query;

    let query = { user: req.user.id };
    if (read !== undefined) query.read = read === 'true';
=======
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;

    let query = { user: req.user.id };
    if (isRead !== undefined) query.isRead = isRead === 'true';
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
<<<<<<< HEAD
      read: false 
=======
      isRead: false 
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
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

<<<<<<< HEAD
// PATCH /api/notifications/:id/read - Marquer une notification comme lue
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }

<<<<<<< HEAD
    notification.read = true;
=======
    notification.isRead = true;
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    notification.readAt = Date.now();
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

<<<<<<< HEAD
// PATCH /api/notifications/read-all - Marquer toutes comme lues
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true, readAt: Date.now() }
=======
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: Date.now() }
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    );

    res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

<<<<<<< HEAD
// PATCH /api/notifications/:id/unread - Marquer une notification comme non lue
const markAsUnread = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }

    notification.read = false;
    notification.readAt = undefined;
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications/:id - Supprimer une notification
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }

    res.json({ success: true, message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

<<<<<<< HEAD
// DELETE /api/notifications - Supprimer toutes les notifications
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ success: true, message: 'Toutes les notifications ont été supprimées' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

<<<<<<< HEAD
// GET /api/notifications/unread-count - Compter les notifications non lues
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user: req.user.id, 
<<<<<<< HEAD
      read: false 
=======
      isRead: false 
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UN SEUL export à la fin avec TOUTES les fonctions
module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
<<<<<<< HEAD
  markAsUnread,
=======
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount
};