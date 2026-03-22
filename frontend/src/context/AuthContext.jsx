import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isSaaSPath = window.location.pathname.startsWith('/securegate');
    const savedUser = localStorage.getItem('auth_user');
    const adminUser = localStorage.getItem('admin_user');
    const imp = localStorage.getItem('is_impersonating') === 'true';

    // In a same-origin dev environment, we use the URL to decide which user context to load
    if (isSaaSPath && adminUser) {
        setUser(JSON.parse(adminUser));
    } else if (savedUser) {
        setUser(JSON.parse(savedUser));
    }

    setIsImpersonating(imp);
    setLoading(false);
  }, []);

  const login = async (credentials, type = 'tenant') => {
    // Check if this is a token-based login (Impersonation)
    if (credentials.token) {
      localStorage.setItem('token', credentials.token);
      localStorage.setItem('is_impersonating', 'true');
      setIsImpersonating(true);
      const baseURL = type === 'admin' ? '/central-api' : api.defaults.baseURL;
      try {
        const response = await api.get('/user', {
          baseURL,
          headers: {
            'Authorization': `Bearer ${credentials.token}`
          }
        });
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true };
      } catch (error) {
        console.error('Auto-login with token failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('is_impersonating');
        setIsImpersonating(false);
        return { success: false, error: 'Invalid or expired impersonation token' };
      }
    }

    const endpoint = type === 'admin' ? '/saas/login' : '/login';
    try {
      const baseURL = type === 'admin' ? '/central-api' : api.defaults.baseURL;

      const response = await api.post(endpoint, credentials, {
        baseURL,
      });
      const data = response.data;
      
      if (data.requires_2fa) {
        return { success: true, requires2FA: true, email: credentials.email, method: data.method };
      }

      const userData = data.user || data; 
      
      if (data.token) {
        if (type === 'admin') {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(userData));
          localStorage.setItem('auth_type', 'admin');
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }
      }
      
      setUser(userData);
      return { 
        success: true, 
        tenant_domain: data.tenant_domain,
        token: data.token 
      };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const verify2FA = async (email, code, method = 'email', type = 'admin') => {
    try {
      const endpoint = type === 'admin' ? '/saas/login/verify-2fa' : '/login/verify-2fa';
      const baseURL = type === 'admin' ? '/central-api' : api.defaults.baseURL;

      const response = await api.post(endpoint, { email, code, method }, {
        baseURL,
      });
      const data = response.data;
      const userData = data.user || data;

      if (data.token) {
        if (type === 'admin') {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(userData));
          localStorage.setItem('auth_type', 'admin');
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }
        setUser(userData);
        return { 
          success: true,
          tenant_domain: data.tenant_domain,
          token: data.token
        };
      }
      return { success: false, error: 'Invalid verification code' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Verification failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsImpersonating(false);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_type');
    localStorage.removeItem('tenant_domain');
    localStorage.removeItem('is_impersonating');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  };

  const stopImpersonating = () => {
    // Clear tenant-side only
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('is_impersonating');
    localStorage.removeItem('tenant_domain');
    setIsImpersonating(false);

    // Restore admin identity for UI if we are in admin context
    const isSaaSPath = window.location.pathname.startsWith('/securegate');
    const adminUser = localStorage.getItem('admin_user');
    if (isSaaSPath && adminUser) {
        setUser(JSON.parse(adminUser));
    } else {
        setUser(null);
    }
    
    api.defaults.baseURL = '/central-api'; 
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      isImpersonating, 
      setIsImpersonating,
      loading, 
      login, 
      verify2FA, 
      logout,
      stopImpersonating
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
