import api from './api';

const stockMovementService = {
  getMovements: async () => {
    const response = await api.get('/stock-movements');
    return response.data;
  },
  createMovement: async (data) => {
    const response = await api.post('/stock-movements', data);
    return response.data;
  },
  deleteMovement: async (id) => {
    const response = await api.delete(`/stock-movements/${id}`);
    return response.data;
  }
};

export default stockMovementService;