// src/services/clientService.js
import api from './api';

export const clientService = {
  // Récupérer tous les clients
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur getAll clients:', error);
      throw error;
    }
  },

  // Récupérer un client par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur getById client ${id}:`, error);
      throw error;
    }
  },

  // Créer un client
  create: async (clientData) => {
    try {
      const response = await api.post('/customers', clientData);
      return response.data;
    } catch (error) {
      console.error('Erreur create client:', error);
      throw error;
    }
  },

  // Mettre à jour un client
  update: async (id, clientData) => {
    try {
      const response = await api.put(`/customers/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Erreur update client ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un client
  delete: async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur delete client ${id}:`, error);
      throw error;
    }
  },

  // Statistiques clients
  getStats: async () => {
    try {
      const response = await api.get('/customers/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur getStats clients:', error);
      throw error;
    }
  },

  // Recherche de clients
  search: async (query) => {
    try {
      const response = await api.get('/customers/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Erreur search clients:', error);
      throw error;
    }
  },

  // Récupérer les commandes d'un client
  getOrders: async (clientId) => {
    try {
      const response = await api.get(`/customers/${clientId}/orders`);
      return response.data;
    } catch (error) {
      console.error(`Erreur getOrders client ${clientId}:`, error);
      throw error;
    }
  },

  // Récupérer les factures d'un client
  getInvoices: async (clientId) => {
    try {
      const response = await api.get(`/customers/${clientId}/invoices`);
      return response.data;
    } catch (error) {
      console.error(`Erreur getInvoices client ${clientId}:`, error);
      throw error;
    }
  }
};