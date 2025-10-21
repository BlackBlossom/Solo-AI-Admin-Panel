import axiosInstance from './axios';

export const videoService = {
  // Get all videos with filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/videos', { params });
    return response.data;
  },

  // Delete video
  delete: async (id) => {
    const response = await axiosInstance.delete(`/videos/${id}`);
    return response.data;
  },
};
