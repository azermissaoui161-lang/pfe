// src/services/authService.js
import api from './api';
import { persistAuth, clearAuth, getStoredUser } from '../utils/auth';

const authService = {
  // ===== AUTHENTIFICATION UNIQUEMENT =====
  
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success && response.data.token) {
        persistAuth({
          token: response.data.token,
          user: response.data.user
        });

        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      }

      return {
        success: false,
        message: response.data.message || 'Erreur de connexion'
      };
    } catch (error) {
      console.error('Erreur login:', error);

      let message = 'Erreur de connexion au serveur';

      if (error.response) {
        message = error.response.data.message || 'Email ou mot de passe incorrect';
      } else if (error.request) {
        message = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      }

      return {
        success: false,
        message
      };
    }
  },

  logout: () => {
    clearAuth();
    window.location.href = '/login';
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      
      if (response.data.success && response.data.token) {
        const currentUser = getStoredUser();
        persistAuth({
          token: response.data.token,
          user: currentUser
        });
        
        return {
          success: true,
          token: response.data.token
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Erreur refreshToken:', error);
      return { success: false };
    }
  },

  getCurrentUser: () => {
    return getStoredUser();
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token') && !!getStoredUser();
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;