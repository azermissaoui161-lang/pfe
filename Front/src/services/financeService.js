import api from './api';

const financeService = {
  // ===== TRANSACTIONS =====
  getTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },
  
  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },
  
  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },
  
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // ===== COMPTES =====
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },
  
  createAccount: async (data) => {
    const response = await api.post('/accounts', data);
    return response.data;
  },
  
  updateAccount: async (id, data) => {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data;
  },
  
  deleteAccount: async (id) => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },

  // ===== BUDGETS =====
  getBudgets: async () => {
    const response = await api.get('/budgets');
    return response.data;
  },
  
  createBudget: async (data) => {
    const response = await api.post('/budgets', data);
    return response.data;
  },
  
  updateBudget: async (id, data) => {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data;
  },
  
  deleteBudget: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },

  // ===== RAPPORTS =====
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  
  createReport: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  
  updateReport: async (id, data) => {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  },
  
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // ===== STATISTIQUES =====
  getDashboardStats: async () => {
    const response = await api.get('/finance/dashboard');
    return response.data;
  }
};

export default financeService;