import axios from 'axios';

const getBaseURL = () => {
  const domain = localStorage.getItem('tenant_domain');
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isCentral = hostname === 'resevit.com' || hostname === 'www.resevit.com' || (hostname.includes('.test') && !hostname.includes('.'));

  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';

  if (domain && domain !== 'no-domain') {
    return `${protocol}//${domain}/tenant-api`;
  }

  if (isCentral) {
    return import.meta.env.VITE_CENTRAL_API_BASE_URL || `${protocol}//${hostname}/central-api`;
  }

  return import.meta.env.VITE_API_BASE_URL || `${protocol}//${hostname}/tenant-api`;
};

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Dynamically set baseURL on every request so it respects any
// tenant_domain that was set in localStorage after module initialization
// (e.g. right after a cross-domain login redirect).
api.interceptors.request.use((config) => {
  // Always recalculate the base URL per request
  config.baseURL = getBaseURL();

  // Determine if we should use admin token or tenant token
  const isAdminRequest = config.url?.includes('/saas/') || config.url?.includes('/central-api');
  const token = isAdminRequest
    ? localStorage.getItem('admin_token')
    : localStorage.getItem('token');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
