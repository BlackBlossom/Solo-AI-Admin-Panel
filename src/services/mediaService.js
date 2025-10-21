import axiosInstance from './axios';

export const mediaService = {
  // Get all media with filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/media', { params });
    return response.data;
  },

  // Get single media
  getById: async (id) => {
    const response = await axiosInstance.get(`/media/${id}`);
    return response.data;
  },

  // Upload media
  upload: async (formData, onUploadProgress) => {
    const response = await axiosInstance.post('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Update media
  update: async (id, data) => {
    const response = await axiosInstance.patch(`/media/${id}`, data);
    return response.data;
  },

  // Toggle media status
  toggleStatus: async (id) => {
    const response = await axiosInstance.patch(`/media/${id}/toggle-status`);
    return response.data;
  },

  // Delete media
  delete: async (id) => {
    const response = await axiosInstance.delete(`/media/${id}`);
    return response.data;
  },

  // Bulk delete media
  bulkDelete: async (ids) => {
    const response = await axiosInstance.post('/media/bulk-delete', { ids });
    return response.data;
  },
};
