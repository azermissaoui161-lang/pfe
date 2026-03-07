// src/services/orderService.js
import api from './api';

export const orderService = {
  // Récupérer toutes les commandes
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur getAll orders:', error);
      throw error;
    }
  },

  // Récupérer une commande par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur getById order ${id}:`, error);
      throw error;
    }
  },

  // Créer une commande
  create: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Erreur create order:', error);
      throw error;
    }
  },

  // Mettre à jour une commande
  update: async (id, orderData) => {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error(`Erreur update order ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une commande
  delete: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur delete order ${id}:`, error);
      throw error;
    }
  },

  // Statistiques des commandes
  getStats: async () => {
    try {
      const response = await api.get('/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur getStats orders:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une commande
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Erreur updateStatus order ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les commandes par client
  getByClient: async (clientId) => {
    try {
      const response = await api.get(`/orders/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur getByClient ${clientId}:`, error);
      throw error;
    }
  },

  // Récupérer les commandes par statut
  getByStatus: async (status) => {
    try {
      const response = await api.get('/orders/status', { params: { status } });
      return response.data;
    } catch (error) {
      console.error(`Erreur getByStatus ${status}:`, error);
      throw error;
    }
  }
};