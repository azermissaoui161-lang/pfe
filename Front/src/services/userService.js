// src/services/userService.js
import api from './api';
import { persistAuth, getStoredUser } from '../utils/auth';

const userService = {
  /**
   * Récupère le profil de l'utilisateur connecté
   * @returns {Promise<Object>} Données du profil
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProfile:', error);
      throw error;
    }
  },

  /**
   * Met à jour le profil utilisateur
   * @param {Object} userData - Nouvelles données
   * @returns {Promise<Object>} Résultat de la mise à jour
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      
      if (response.data.success) {
        const currentUser = getStoredUser();
        persistAuth({
          token: localStorage.getItem('token'),
          user: { ...currentUser, ...userData }
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateProfile:', error);
      throw error;
    }
  },

  /**
   * Change le mot de passe
   * @param {string} currentPassword - Mot de passe actuel
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {Promise<Object>} Résultat du changement
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur changePassword:', error);
      throw error;
    }
  },

  /**
   * Vérifie si le mot de passe est correct
   * @param {string} password - Mot de passe à vérifier
   * @returns {Promise<boolean>} true si valide
   */
  verifyPassword: async (password) => {
    try {
      const response = await api.post('/users/verify-password', { password });
      return response.data.valid;
    } catch (error) {
      console.error('❌ Erreur verifyPassword:', error);
      return false;
    }
  },

  /**
   * Récupère les préférences d'un module
   * @param {string} module - Nom du module (stock, finance, facturation)
   * @returns {Promise<Object>} Préférences du module
   */
  getPreferences: async (module) => {
    try {
      const response = await api.get(`/users/preferences/${module}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getPreferences ${module}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour les préférences d'un module
   * @param {string} module - Nom du module
   * @param {Object} preferences - Nouvelles préférences
   * @returns {Promise<Object>} Préférences mises à jour
   */
  updatePreferences: async (module, preferences) => {
    try {
      const response = await api.put(`/users/preferences/${module}`, preferences);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur updatePreferences ${module}:`, error);
      throw error;
    }
  },

  /**
   * Supprime le compte utilisateur
   * @returns {Promise<Object>} Confirmation de suppression
   */
  deleteAccount: async () => {
    try {
      const response = await api.delete('/users/profile');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur deleteAccount:', error);
      throw error;
    }
  },

  /**
   * Récupère l'historique des connexions
   * @returns {Promise<Array>} Historique des connexions
   */
  getLoginHistory: async () => {
    try {
      const response = await api.get('/users/login-history');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getLoginHistory:', error);
      throw error;
    }
  }
};

export default userService;