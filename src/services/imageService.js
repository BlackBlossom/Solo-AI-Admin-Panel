import axios from './axios';

// Image API is not under /admin path, so we need to use the parent API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/admin';
const IMAGE_API_URL = API_BASE_URL.replace('/admin', '/images');

export const imageService = {
  // Upload image
  upload: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IMAGE_API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  // Delete image
  delete: async (filename) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${IMAGE_API_URL}/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  // Get all images
  getAll: async () => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(IMAGE_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  // Get public image URL
  getPublicUrl: (filename) => {
    const baseUrl = API_BASE_URL.replace('/api/v1/admin', '');
    return `${baseUrl}/api/v1/images/serve/${filename}`;
  }
};

export default imageService;
