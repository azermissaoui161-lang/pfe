// src/services/productService.js
import api from './api';

const productService = {
  // GET /api/products - Récupérer tous les produits
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // GET /api/products/:id - Récupérer un produit
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // POST /api/products - Créer un produit
  create: async (productData) => {
    const response = await api.post('/products', {
      name: productData.name,
      category: productData.category,
      stock: parseInt(productData.stock) || 0,
      price: parseInt(productData.price) || 0,
      supplierId: productData.supplierId
    });
    return response.data;
  },

  // PUT /api/products/:id - Mettre à jour un produit
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, {
      name: productData.name,
      category: productData.category,
      stock: parseInt(productData.stock),
      price: parseInt(productData.price),
      supplierId: productData.supplierId
    });
    return response.data;
  },

  // DELETE /api/products/:id - Supprimer un produit
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // GET /api/products/stock/alert - Produits en alerte
  getLowStock: async () => {
    const response = await api.get('/products/stock/alert');
    return response.data;
  }
};

export default productService;