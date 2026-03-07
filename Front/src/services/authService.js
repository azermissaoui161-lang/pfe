// src/services/authService.js
import api from './api';
import { persistAuth, clearAuth, getStoredUser } from '../utils/auth';

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

  // ✅ Mise à jour du profil (version améliorée)
  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.put('/auth/profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Récupérer l'utilisateur actuel
        const currentUser = getStoredUser() || {};
        
        // Construire l'utilisateur mis à jour
        const updatedUser = {
          ...currentUser,
          ...userData
        };
        
        // Si newEmail est fourni, l'utiliser comme email
        if (userData.newEmail) {
          updatedUser.email = userData.newEmail;
        }

        // Mettre à jour le localStorage via persistAuth
        persistAuth({
          token: localStorage.getItem('token'),
          user: updatedUser
        });

        return {
          success: true,
          message: response.data.message || 'Profil mis à jour avec succès'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Erreur lors de la mise à jour'
      };
    } catch (error) {
      console.error('Erreur updateProfile:', error);

      let message = 'Erreur de connexion au serveur';

      if (error.response) {
        if (error.response.status === 401) {
          message = 'Mot de passe actuel incorrect';
        } else if (error.response.status === 400) {
          message = error.response.data.message || 'Données invalides';
        } else {
          message = error.response.data.message || 'Erreur lors de la mise à jour';
        }
      } else if (error.request) {
        message = 'Le serveur ne repond pas. Verifiez votre connexion.';
      }

      return {
        success: false,
        message
      };
    }
  },

  // ✅ Vérifier l'ancien mot de passe
  verifyPassword: async (password) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.post('/auth/verify-password', { password }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.valid;
    } catch (error) {
      console.error('Erreur verifyPassword:', error);
      return false;
    }
  },

  // ✅ Déconnexion (utilise clearAuth de auth.js)
  logout: () => {
    clearAuth();
    // Optionnel : rediriger vers la page de login
    window.location.href = '/login';
  },

  // ✅ Récupérer l'utilisateur courant (utilise getStoredUser)
  getCurrentUser: () => {
    return getStoredUser();
  },

  // ✅ Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    return !!localStorage.getItem('token') && !!getStoredUser();
  },

  // ✅ Récupérer le token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // ✅ NOUVELLE FONCTION : Rafraîchir le token
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
      
      return {
        success: false
      };
    } catch (error) {
      console.error('Erreur refreshToken:', error);
      return {
        success: false
      };
    }
  },

  // ✅ NOUVELLE FONCTION : Changer le mot de passe
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        success: response.data.success,
        message: response.data.message || 'Mot de passe changé avec succès'
      };
    } catch (error) {
      console.error('Erreur changePassword:', error);
      
      let message = 'Erreur lors du changement de mot de passe';
      
      if (error.response) {
        if (error.response.status === 401) {
          message = 'Mot de passe actuel incorrect';
        } else {
          message = error.response.data.message || message;
        }
      }
      
      return {
        success: false,
        message
      };
    }
  }
};

export default authService;