import axios from './axios';

export const legalService = {
  // Get all legal content
  getAll: async () => {
    const response = await axios.get('/legal');
    return response.data;
  },

  // Get legal content by type
  getByType: async (type) => {
    const response = await axios.get(`/legal/${type}`);
    return response.data;
  },

  // Create or update legal content
  createOrUpdate: async (data) => {
    const response = await axios.post('/legal', data);
    return response.data;
  },

  // Update legal content by type
  update: async (type, data) => {
    const response = await axios.patch(`/legal/${type}`, data);
    return response.data;
  },

  // Delete legal content by type
  delete: async (type) => {
    const response = await axios.delete(`/legal/${type}`);
    return response.data;
  },

  // Toggle publish status
  togglePublish: async (type) => {
    const response = await axios.patch(`/legal/${type}/publish`);
    return response.data;
  }
};
