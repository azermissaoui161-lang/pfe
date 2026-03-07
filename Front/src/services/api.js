import axios from 'axios';
import { clearAuth } from '../utils/auth';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 10000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[API] ${String(config.method || 'get').toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout - Le serveur ne repond pas');
    } else if (error.response) {
      console.error(`Erreur ${error.response.status}:`, error.response.data);

      if (error.response.status === 401) {
        clearAuth();
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('Aucune reponse du serveur. Verifiez que le back-end est lance.');
    } else {
      console.error('Erreur:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;