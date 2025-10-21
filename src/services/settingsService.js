import axiosInstance from './axios';

export const settingsService = {
  // Get settings with disclosure level
  // disclosure: 'public' (default), 'masked' (superadmin only), 'full' (superadmin only)
  get: async (disclosure = 'full') => {
    const response = await axiosInstance.get('/settings', {
      params: { disclosure },
    });
    return response.data;
  },

  // Update settings
  update: async (data) => {
    const response = await axiosInstance.patch('/settings', data);
    return response.data;
  },
};
