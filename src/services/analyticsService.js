import axiosInstance from './axios';

export const analyticsService = {
  // Get analytics overview
  getOverview: async (params = {}) => {
    const response = await axiosInstance.get('/analytics/overview', { params });
    return response.data;
  },

  // Get user analytics
  getUserAnalytics: async (params = {}) => {
    const response = await axiosInstance.get('/analytics/users', { params });
    return response.data;
  },
};
