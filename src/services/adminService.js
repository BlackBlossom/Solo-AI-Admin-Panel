import axios from './axios';

export const adminService = {
  // Get all admins with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined && filters.isActive !== '') {
      params.append('isActive', filters.isActive);
    }
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await axios.get(`/admins?${params.toString()}`);
    return response.data;
  },

  // Create new admin
  create: async (adminData) => {
    const response = await axios.post('/admins', adminData);
    return response.data;
  },

  // Update admin
  update: async (id, updateData) => {
    const response = await axios.patch(`/admins/${id}`, updateData);
    return response.data;
  },

  // Restrict/Unrestrict admin
  restrict: async (id, restrictData) => {
    const response = await axios.patch(`/admins/${id}/restrict`, restrictData);
    return response.data;
  },

  // Delete admin
  delete: async (id) => {
    const response = await axios.delete(`/admins/${id}`);
    return response.data;
  }
};
