// src/services/supplierService.js
import api from './api';

const supplierService = {
  // GET /api/suppliers - Récupérer tous les fournisseurs
  getAll: async () => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  // GET /api/suppliers/:id - Récupérer un fournisseur
  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  // POST /api/suppliers - Créer un fournisseur
  create: async (supplierData) => {
    const response = await api.post('/suppliers', {
      name: supplierData.name,
      contact: supplierData.contact,
      email: supplierData.email,
      phone: supplierData.phone,
      address: supplierData.address,
      status: supplierData.status,
      rating: parseFloat(supplierData.rating)
    });
    return response.data;
  },

  // PUT /api/suppliers/:id - Mettre à jour un fournisseur
  update: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, {
      name: supplierData.name,
      contact: supplierData.contact,
      email: supplierData.email,
      phone: supplierData.phone,
      address: supplierData.address,
      status: supplierData.status,
      rating: parseFloat(supplierData.rating)
    });
    return response.data;
  },

  // DELETE /api/suppliers/:id - Supprimer un fournisseur
  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  }
};

export default supplierService;