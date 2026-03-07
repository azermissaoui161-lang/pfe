// src/controllers/notificationController.js
const Notification = require('../models/Notification');

// Définir les fonctions comme des constantes
const createNotification = async (userId, type, title, message, data = {}, priority = 'moyenne') => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      priority
    });
    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
    return null;
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;

    let query = { user: req.user.id };
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
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

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: Date.now() }
    );

    res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ success: true, message: 'Toutes les notifications ont été supprimées' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
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
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount
};