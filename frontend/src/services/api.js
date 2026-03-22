import axios from 'axios';

const getBaseURL = () => {
  const domain = localStorage.getItem('tenant_domain');
  if (domain && domain !== 'no-domain') {
    // Use current page protocol to avoid mixed-content blocks (https pages can't call http)
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    return `${protocol}//${domain}/api`;
  }
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach auth token if stored
api.interceptors.request.use((config) => {
  // Determine if we should use admin token or tenant token
  const isAdminRequest = config.url.includes('/saas/') || config.url.includes('/central-api');
  const token = isAdminRequest 
    ? localStorage.getItem('admin_token') 
    : localStorage.getItem('token');
    
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
