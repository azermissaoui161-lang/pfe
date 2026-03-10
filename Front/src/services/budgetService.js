// src/services/budgetService.js
import api from './api';

export const budgetService = {
  // Récupérer tous les budgets
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/budgets', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAll budgets:', error);
      throw error;
    }
  },

  // Récupérer un budget par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getById budget ${id}:`, error);
      throw error;
    }
  },

  // Créer un budget
  create: async (budgetData) => {
    try {
      const response = await api.post('/budgets', budgetData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur create budget:', error);
      throw error;
    }
  },

  // Mettre à jour un budget
  update: async (id, budgetData) => {
    try {
      const response = await api.put(`/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur update budget ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un budget
  delete: async (id) => {
    try {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur delete budget ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les budgets par mois
  getByMonth: async (month) => {
    try {
      const response = await api.get(`/budgets/month/${month}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getByMonth ${month}:`, error);
      throw error;
    }
  },

  // Récupérer les statistiques
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/budgets/stats', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getStats budgets:', error);
      throw error;
    }
  },

  // Mettre à jour le réalisé
  updateActual: async (id, amount) => {
    try {
      const response = await api.post(`/budgets/${id}/actual`, { amount });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur updateActual budget ${id}:`, error);
      throw error;
    }
  }
};