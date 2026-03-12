// src/services/clientService.js
import api from './api';

export const clientService = {
  // Récupérer tous les clients
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAll clients:', error);
      throw error;
    }
  },

  // Alias pour compatibilité avec FacturationAdmin
  getClients: async (params = {}) => {
    return clientService.getAll(params);
  },

  // Récupérer un client par ID
  getById: async (id) => {
    try {
      // Validation de l'ID
      if (!id) {
        throw new Error('ID du client requis');
      }
      
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getById client ${id}:`, error);
      throw error;
    }
  },

  // Créer un client
  create: async (clientData) => {
    try {
      // Validation des données
      if (!clientData || typeof clientData !== 'object') {
        throw new Error('Données client invalides');
      }

      // Validation du nom
      if (!clientData.name?.trim()) {
        throw new Error('Le nom du client est requis');
      }
      if (clientData.name.length > 100) {
        throw new Error('Le nom ne peut pas dépasser 100 caractères');
      }

      // Validation de l'email
      if (!clientData.email?.trim()) {
        throw new Error('L\'email est requis');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientData.email)) {
        throw new Error('Format d\'email invalide');
      }

      // Validation du téléphone
      if (!clientData.phone?.trim()) {
        throw new Error('Le téléphone est requis');
      }
      const phoneRegex = /^[0-9+\-\s]+$/;
      if (!phoneRegex.test(clientData.phone)) {
        throw new Error('Format de téléphone invalide');
      }

      // Validation du SIRET (si fourni)
      if (clientData.siret) {
        const siretRegex = /^\d{14}$/;
        if (!siretRegex.test(clientData.siret.replace(/\s/g, ''))) {
          throw new Error('Le SIRET doit contenir 14 chiffres');
        }
      }

      const response = await api.post('/customers', {
        ...clientData,
        email: clientData.email.trim().toLowerCase(),
        phone: clientData.phone.trim()
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur create client:', error);
      throw error;
    }
  },

  // Mettre à jour un client
  update: async (id, clientData) => {
    try {
      // Validation de l'ID
      if (!id) {
        throw new Error('ID du client requis');
      }

      // Validation des données
      if (!clientData || typeof clientData !== 'object') {
        throw new Error('Données client invalides');
      }

      // Préparer les données mises à jour
      const updatedData = { ...clientData };

      // Validation conditionnelle des champs
      if (clientData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(clientData.email)) {
          throw new Error('Format d\'email invalide');
        }
        updatedData.email = clientData.email.trim().toLowerCase();
      }

      if (clientData.phone) {
        const phoneRegex = /^[0-9+\-\s]+$/;
        if (!phoneRegex.test(clientData.phone)) {
          throw new Error('Format de téléphone invalide');
        }
        updatedData.phone = clientData.phone.trim();
      }

      if (clientData.name && clientData.name.length > 100) {
        throw new Error('Le nom ne peut pas dépasser 100 caractères');
      }

      if (clientData.siret) {
        const siretRegex = /^\d{14}$/;
        if (!siretRegex.test(clientData.siret.replace(/\s/g, ''))) {
          throw new Error('Le SIRET doit contenir 14 chiffres');
        }
      }

      const response = await api.put(`/customers/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur update client ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un client
  delete: async (id) => {
    try {
      // Validation de l'ID
      if (!id) {
        throw new Error('ID du client requis');
      }

      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur delete client ${id}:`, error);
      throw error;
    }
  },


  // Recherche de clients
  search: async (query) => {
    try {
      if (!query?.trim()) {
        throw new Error('Terme de recherche requis');
      }

      const response = await api.get('/customers/search', { 
        params: { q: query.trim() } 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur search clients:', error);
      throw error;
    }
  },

  // Récupérer les commandes d'un client
  getOrders: async (clientId) => {
    try {
      if (!clientId) {
        throw new Error('ID du client requis');
      }

      const response = await api.get(`/customers/${clientId}/orders`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getOrders client ${clientId}:`, error);
      throw error;
    }
  },

  // Récupérer les factures d'un client
  getInvoices: async (clientId) => {
    try {
      if (!clientId) {
        throw new Error('ID du client requis');
      }

      const response = await api.get(`/customers/${clientId}/invoices`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getInvoices client ${clientId}:`, error);
      throw error;
    }
  }
};

export const customerService = clientService;