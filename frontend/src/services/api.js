import axios from 'axios';

const getBaseURL = () => {
  const domain = localStorage.getItem('tenant_domain');
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isCentral = hostname === 'resevit.com' || hostname === 'www.resevit.com' || hostname.includes('.test') && !hostname.includes('.'); // Simplistic central check

  if (domain && domain !== 'no-domain') {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    return `${protocol}//${domain}/tenant-api`;
  }

  // On central domain, use the consolidated working prefix
  if (isCentral) {
    return import.meta.env.VITE_CENTRAL_API_BASE_URL || '/central-api';
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
