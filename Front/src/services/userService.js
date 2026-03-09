// src/services/userService.js (À CRÉER)
import api from './api';
import { persistAuth, getStoredUser } from '../utils/auth';

const userService = {
  // GET /api/users/profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // PUT /api/users/profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    
    if (response.data.success) {
      const currentUser = getStoredUser();
      persistAuth({
        token: localStorage.getItem('token'),
        user: { ...currentUser, ...userData }
      });
    }
    
    return response.data;
  },

  // POST /api/users/change-password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // POST /api/users/verify-password
  verifyPassword: async (password) => {
    const response = await api.post('/users/verify-password', { password });
    return response.data.valid;
  },

  // GET /api/users/preferences/:module
  getPreferences: async (module) => {
    const response = await api.get(`/users/preferences/${module}`);
    return response.data;
  },

  // PUT /api/users/preferences/:module
  updatePreferences: async (module, preferences) => {
    const response = await api.put(`/users/preferences/${module}`, preferences);
    return response.data;
  }
};

export default userService;