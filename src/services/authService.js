import api from './api';
import { persistAuth, clearAuth } from '../utils/auth';

const authService = {
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
        message = 'Le serveur ne repond pas. Verifiez votre connexion.';
      }

      return {
        success: false,
        message
      };
    }
  },

  logout: () => {
    clearAuth();
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;