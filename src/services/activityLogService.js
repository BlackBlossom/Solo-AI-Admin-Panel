import axiosInstance from './axios';

export const activityLogService = {
  // Get activity logs
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/activity-logs', { params });
    return response.data;
  },
};
