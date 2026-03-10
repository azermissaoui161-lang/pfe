// src/services/invoiceService.js
import api from './api';

export const invoiceService = {
  // ===== MÉTHODES PRINCIPALES =====
  
  /**
   * Récupérer toutes les factures
   * @param {Object} params - Paramètres de requête (pagination, filtres)
   * @returns {Promise<Array>} Liste des factures
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAll invoices:', error);
      throw error;
    }
  },

  /**
   * ALIAS pour compatibilité avec FacturationAdmin
   * Utilise getAll() en interne
   */
  getInvoices: async (params = {}) => {
    return invoiceService.getAll(params);
  },

  /**
   * Récupérer une facture par ID
   * @param {string} id - ID de la facture
   * @returns {Promise<Object>} Détails de la facture
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getById invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Créer une facture
   * @param {Object} invoiceData - Données de la facture
   * @returns {Promise<Object>} Facture créée
   */
  create: async (invoiceData) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur create invoice:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour une facture
   * @param {string} id - ID de la facture
   * @param {Object} invoiceData - Nouvelles données
   * @returns {Promise<Object>} Facture mise à jour
   */
  update: async (id, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur update invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer une facture
   * @param {string} id - ID de la facture
   * @returns {Promise<Object>} Confirmation de suppression
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur delete invoice ${id}:`, error);
      throw error;
    }
  },

  // ===== MÉTHODES MÉTIER SPÉCIALISÉES =====

  /**
   * Marquer une facture comme payée
   * @param {string} id - ID de la facture
   * @returns {Promise<Object>} Facture mise à jour
   */
  markAsPaid: async (id) => {
    try {
      const response = await api.patch(`/invoices/${id}/pay`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur markAsPaid invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Archiver une facture
   * @param {string} id - ID de la facture
   * @param {string} reason - Motif d'archivage
   * @returns {Promise<Object>} Facture archivée
   */
  archive: async (id, reason) => {
    try {
      const response = await api.post(`/invoices/${id}/archive`, { reason });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur archive invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Restaurer une facture archivée
   * @param {string} id - ID de la facture
   * @returns {Promise<Object>} Facture restaurée
   */
  restore: async (id) => {
    try {
      const response = await api.post(`/invoices/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur restore invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer le journal d'archivage
   * @returns {Promise<Array>} Historique des archives
   */
  getArchiveLog: async () => {
    try {
      const response = await api.get('/invoices/archive-log');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getArchiveLog:', error);
      throw error;
    }
  },

  /**
   * Générer une facture à partir d'une commande
   * @param {string} orderId - ID de la commande
   * @returns {Promise<Object>} Facture générée
   */
  generateFromOrder: async (orderId) => {
    try {
      const response = await api.post('/invoices/from-order', { orderId });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur generateFromOrder ${orderId}:`, error);
      throw error;
    }
  },

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Télécharger une facture en PDF
   * @param {string} id - ID de la facture
   * @returns {Promise<boolean>} Succès du téléchargement
   */
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
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error(`❌ Erreur downloadPdf invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Envoyer une facture par email
   * @param {string} id - ID de la facture
   * @param {string} email - Email du destinataire
   * @returns {Promise<Object>} Confirmation d'envoi
   */
  sendByEmail: async (id, email) => {
    try {
      const response = await api.post(`/invoices/${id}/send`, { email });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur sendByEmail invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques des factures
   * @returns {Promise<Object>} Statistiques
   */
  getStats: async () => {
    try {
      const response = await api.get('/invoices/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getStats invoices:', error);
      throw error;
    }
  },

  /**
   * Dupliquer une facture
   * @param {string} id - ID de la facture à dupliquer
   * @returns {Promise<Object>} Nouvelle facture
   */
  duplicate: async (id) => {
    try {
      const response = await api.post(`/invoices/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur duplicate invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Annuler une facture
   * @param {string} id - ID de la facture
   * @param {string} reason - Motif d'annulation
   * @returns {Promise<Object>} Facture annulée
   */
  cancel: async (id, reason) => {
    try {
      const response = await api.post(`/invoices/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur cancel invoice ${id}:`, error);
      throw error;
    }
  }
};