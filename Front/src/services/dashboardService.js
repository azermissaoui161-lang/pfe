// src/services/dashboardService.js
import api from './api';

export const dashboardService = {
  // Statistiques du dashboard facturation
  getFactureStats: async () => {
    try {
      const response = await api.get('/dashboard/facture/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur getFactureStats:', error);
      throw error;
    }
  },

  // Statistiques du dashboard finance
  getFinanceStats: async () => {
    try {
      const response = await api.get('/dashboard/finance/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur getFinanceStats:', error);
      throw error;
    }
  },

  // Statistiques du dashboard stock
  getStockStats: async () => {
    try {
      const response = await api.get('/dashboard/stock/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur getStockStats:', error);
      throw error;
    }
  },

  // Statistiques du dashboard principal
  getPrincipalStats: async () => {
    try {
      const response = await api.get('/dashboard/principal/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur getPrincipalStats:', error);
      throw error;
    }
  },

  // Activités récentes
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get('/dashboard/recent-activities', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getRecentActivities:', error);
      throw error;
    }
  },

  // Graphiques
  getChartData: async (type, period = 'month') => {
    try {
      const response = await api.get(`/dashboard/charts/${type}`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur getChartData ${type}:`, error);
      throw error;
    }
  }
};