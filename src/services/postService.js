import axiosInstance from './axios';

export const postService = {
  // Get all posts with filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/posts', { params });
    return response.data;
  },

  // Delete post
  delete: async (id) => {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return response.data;
  },
};
