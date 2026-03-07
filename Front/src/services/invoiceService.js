// src/services/invoiceService.js
import api from './api';

export const invoiceService = {
  // Récupérer toutes les factures
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur getAll invoices:', error);
      throw error;
    }
  },

  // Récupérer une facture par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur getById invoice ${id}:`, error);
      throw error;
    }
  },

  // Créer une facture
  create: async (invoiceData) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Erreur create invoice:', error);
      throw error;
    }
  },

  // Mettre à jour une facture
  update: async (id, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error(`Erreur update invoice ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une facture
  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur delete invoice ${id}:`, error);
      throw error;
    }
  },

  // Marquer une facture comme payée
  markAsPaid: async (id) => {
    try {
      const response = await api.patch(`/invoices/${id}/pay`);
      return response.data;
    } catch (error) {
      console.error(`Erreur markAsPaid invoice ${id}:`, error);
      throw error;
    }
  },

  // Archiver une facture
  archive: async (id, reason) => {
    try {
      const response = await api.post(`/invoices/${id}/archive`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Erreur archive invoice ${id}:`, error);
      throw error;
    }
  },

  // Restaurer une facture archivée
  restore: async (id) => {
    try {
      const response = await api.post(`/invoices/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`Erreur restore invoice ${id}:`, error);
      throw error;
    }
  },

  // Récupérer le journal d'archivage
  getArchiveLog: async () => {
    try {
      const response = await api.get('/invoices/archive-log');
      return response.data;
    } catch (error) {
      console.error('Erreur getArchiveLog:', error);
      throw error;
    }
  },

  // Générer une facture à partir d'une commande
  generateFromOrder: async (orderId) => {
    try {
      const response = await api.post('/invoices/generate', { orderId });
      return response.data;
    } catch (error) {
      console.error(`Erreur generateFromOrder ${orderId}:`, error);
      throw error;
    }
  },

  // Télécharger une facture en PDF
  downloadPdf: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error(`Erreur downloadPdf invoice ${id}:`, error);
      throw error;
    }
  }
};