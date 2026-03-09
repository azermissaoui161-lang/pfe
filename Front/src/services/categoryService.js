// src/services/categoryService.js
import api from './api';

const categoryService = {
  // GET /api/categories - Récupérer toutes les catégories
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // GET /api/categories/:id - Récupérer une catégorie
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // POST /api/categories - Créer une catégorie
  create: async (categoryData) => {
    const response = await api.post('/categories', {
      name: categoryData.name,
      description: categoryData.description
    });
    return response.data;
  },

  // PUT /api/categories/:id - Mettre à jour une catégorie
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, {
      name: categoryData.name,
      description: categoryData.description
    });
    return response.data;
  },

  // DELETE /api/categories/:id - Supprimer une catégorie
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;