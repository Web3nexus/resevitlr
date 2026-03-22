import axios from 'axios';

/**
 * Central API – used for Super Admin / SaaS routes only.
 * Requests go through the Vite dev proxy (/central-api → http://localhost/api)
 * to avoid CORS issues during development.
 */
const centralApi = axios.create({
  baseURL: '/central-api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

import i18n from '../i18n';

// Attach the stored admin token and locale to every central request
centralApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add locale header
  config.headers['X-Locale'] = i18n.language || 'en';
  
  return config;
});

// Handle 401 errors globally for the central API
centralApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('auth_type');
      // Only redirect if we are already in an admin path
      if (window.location.pathname.startsWith('/securegate')) {
          window.location.href = '/securegate';
      }
    }
    return Promise.reject(error);
  }
);

export default centralApi;
