import axios from './axios';

export const notificationService = {
  // Get all notifications with pagination and filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.targetType) params.append('targetType', filters.targetType);
    if (filters.search) params.append('search', filters.search);
    
    const response = await axios.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  // Get single notification by ID
  getById: async (id) => {
    const response = await axios.get(`/notifications/${id}`);
    return response.data;
  },

  // Check Firebase service health
  checkFirebaseHealth: async () => {
    const response = await axios.get('/notifications/firebase-health');
    return response.data;
  },

  // Send push notification
  send: async (notificationData) => {
    const response = await axios.post('/notifications/send', notificationData);
    return response.data;
  },

  // Get notification statistics
  getStats: async (days = 30) => {
    const response = await axios.get(`/notifications/stats?days=${days}`);
    return response.data;
  },

  // Get target user count preview
  getTargetCount: async (targetData) => {
    const response = await axios.post('/notifications/target-count', targetData);
    return response.data;
  },

  // Send test notification
  sendTest: async (token) => {
    const response = await axios.post('/notifications/test', { token });
    return response.data;
  }
};
