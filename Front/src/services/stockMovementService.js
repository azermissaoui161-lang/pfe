// src/services/stockMovementService.js - VERSION CORRIGÉE
import api from './api';

const stockMovementService = {
  // GET /api/stock - Récupérer tous les mouvements
  getAll: async (params = {}) => {
    const response = await api.get('/stock', { params });  // ✅ CORRIGÉ
    return response.data;
  },

  // POST /api/stock/entry - Entrée de stock
  addEntry: async (data) => {
    const response = await api.post('/stock/entry', {      // ✅ CORRIGÉ
      productId: data.productId,
      quantity: parseInt(data.quantity),
      reason: data.reason || 'adjustment',
      notes: data.note || ''
    });
    return response.data;
  },

  // POST /api/stock/exit - Sortie de stock
  addExit: async (data) => {
    const response = await api.post('/stock/exit', {       // ✅ CORRIGÉ
      productId: data.productId,
      quantity: parseInt(data.quantity),
      reason: data.reason || 'sale',
      notes: data.note || ''
    });
    return response.data;
  },

  // DELETE /api/stock/:id - Supprimer un mouvement
  delete: async (id) => {
    const response = await api.delete(`/stock/${id}`);     // ✅ CORRIGÉ
    return response.data;
  }
};

export default stockMovementService;