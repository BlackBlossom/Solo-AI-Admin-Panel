import axiosInstance from './axios';

export const userService = {
  // Get all users with filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  },

  // Get single user
  getById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  // Ban/Suspend/Reactivate user
  banUser: async (id, payload) => {
    // payload: { status: 'banned'|'suspended'|'active', reason?: string, duration?: number }
    const response = await axiosInstance.patch(`/users/${id}/ban`, payload);
    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },
};
