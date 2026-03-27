const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
<<<<<<< HEAD
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'EXPORT', 'VALIDATE']
=======
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'EXPORT']
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  },
  entity: {
    type: String,
    required: true,
<<<<<<< HEAD
    enum: ['USER', 'PRODUCT', 'INVOICE', 'STOCK', 'SUPPLIER', 'CUSTOMER', 'FINANCE', 'PAYMENT', 'TRANSACTION']
=======
    enum: ['USER', 'PRODUCT', 'INVOICE', 'STOCK', 'SUPPLIER', 'CUSTOMER', 'FINANCE']
>>>>>>> 660161669da5cb0abf6942767dbd69ae6f42b4f8
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);