// src/services/api.js
import axios from 'axios';
import { clearAuth } from '../utils/auth';

// Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const IS_DEV = import.meta.env.MODE === 'development';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Important pour les cookies
  timeout: 10000 // 10 secondes
});

// Intercepteur requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging en développement seulement
    if (IS_DEV) {
      console.log(`🌐 [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      
      // Log des données si présentes
      if (config.data) {
        console.log('📦 Données:', config.data);
      }
    }

    return config;
  },
  (error) => {
    if (IS_DEV) console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur réponse
api.interceptors.response.use(
  (response) => {
    // Logging en développement
    if (IS_DEV) {
      console.log(`✅ [API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Gestion d'erreurs enrichie
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Timeout - Le serveur ne répond pas');
      return Promise.reject({
        message: 'Le serveur met trop de temps à répondre',
        type: 'TIMEOUT'
      });
    }

    if (error.response) {
      // Le serveur a répondu avec une erreur
      const status = error.response.status;
      const data = error.response.data;
      
      console.error(`❌ [API] Erreur ${status}:`, data);

      // Gestion spécifique 401 (non authentifié)
      if (status === 401) {
        clearAuth(); // Nettoie proprement
        window.location.href = '/login';
        return Promise.reject({
          message: 'Session expirée',
          type: 'UNAUTHORIZED'
        });
      }

      // Gestion 403 (non autorisé)
      if (status === 403) {
        return Promise.reject({
          message: 'Accès non autorisé',
          type: 'FORBIDDEN'
        });
      }

      // Gestion 404
      if (status === 404) {
        return Promise.reject({
          message: 'Ressource non trouvée',
          type: 'NOT_FOUND'
        });
      }

      // Gestion 500 (erreur serveur)
      if (status >= 500) {
        return Promise.reject({
          message: 'Erreur serveur',
          type: 'SERVER_ERROR'
        });
      }

      return Promise.reject({
        message: data.message || `Erreur ${status}`,
        type: 'API_ERROR',
        status,
        data
      });
    }

    if (error.request) {
      // La requête a été faite mais pas de réponse
      console.error('🌐 Aucune réponse du serveur');
      return Promise.reject({
        message: 'Impossible de contacter le serveur',
        type: 'NETWORK_ERROR'
      });
    }

    // Autre erreur
    console.error('❌ Erreur:', error.message);
    return Promise.reject({
      message: error.message || 'Erreur inconnue',
      type: 'UNKNOWN_ERROR'
    });
  }
);

export default api;