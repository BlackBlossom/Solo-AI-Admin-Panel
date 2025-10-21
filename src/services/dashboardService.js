import axiosInstance from './axios';

export const dashboardService = {
  // Get dashboard stats
  getStats: async () => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  },
};
