// src/services/accountService.js
import api from './api';

export const accountService = {
  // Récupérer tous les comptes
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/accounts', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAll accounts:', error);
      throw error;
    }
  },

  // Récupérer un compte par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getById account ${id}:`, error);
      throw error;
    }
  },

  // Créer un compte
  create: async (accountData) => {
    try {
      const response = await api.post('/accounts', accountData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur create account:', error);
      throw error;
    }
  },

  // Mettre à jour un compte
  update: async (id, accountData) => {
    try {
      const response = await api.put(`/accounts/${id}`, accountData);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur update account ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un compte
  delete: async (id) => {
    try {
      const response = await api.delete(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur delete account ${id}:`, error);
      throw error;
    }
  },

  // Récupérer le solde d'un compte
  getBalance: async (id) => {
    try {
      const response = await api.get(`/accounts/${id}/balance`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getBalance account ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les transactions d'un compte
  getTransactions: async (id, params = {}) => {
    try {
      const response = await api.get(`/accounts/${id}/transactions`, { params });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getTransactions account ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les statistiques des comptes
  getStats: async () => {
    try {
      const response = await api.get('/accounts/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getStats accounts:', error);
      throw error;
    }
  },

  // Mettre à jour le solde d'un compte
  updateBalance: async (id, amount) => {
    try {
      const response = await api.patch(`/accounts/${id}/balance`, { amount });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur updateBalance account ${id}:`, error);
      throw error;
    }
  }
};