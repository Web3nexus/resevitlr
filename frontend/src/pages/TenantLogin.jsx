import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../hooks/useBranding';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function TenantLogin() {
  const { login, verify2FA, setUser, setIsImpersonating } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const settings = useBranding();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const domain = params.get('domain');
    const impersonate = params.get('impersonate');

    if (token) {
        handleAutoLogin(token, domain);
    } else {
        fetchBusinessInfo();
    }

    if (domain) {
      localStorage.setItem('tenant_domain', domain);
      api.defaults.baseURL = `http://${domain}/api`;
    }
  }, [location]);

  const fetchBusinessInfo = async () => {
    try {
        const hostname = window.location.hostname;
        // MUST use absolute URL to central domain for this lookup
        const centralBaseUrl = window.location.hostname.includes('resevitweb.test') 
          ? `${window.location.protocol}//resevitweb.test` 
          : '';
          
        // The 'api' instance already uses the working '/central-api' prefix on central domains now
        const res = await api.get(`/public/tenant-by-domain/${hostname}`);
        if (res.data) {
            setBusinessName(res.data.business_name);
        }
    } catch (err) {
        // Fallback or ignore
    }
  };

  const handleAutoLogin = async (token, domain) => {
    setIsLoading(true);
    try {
      // Use the domain param if provided, otherwise fall back to the current subdomain
      const targetDomain = domain || window.location.hostname;
      const protocol = window.location.protocol; // Respect http: or https:
      api.defaults.baseURL = `${protocol}//${targetDomain}/api`;
      
      // POST to the dedicated token-based login endpoint
      const { data } = await api.post('/login/token', { token });
      
      if (data?.user) {
        // Store under 'token' key — that's what api.js interceptor reads for tenant requests
        localStorage.setItem('token', token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('tenant_domain', targetDomain);
        localStorage.setItem('is_impersonating', 'true');
        
        // Update global auth context immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        if (setUser) setUser(data.user);
        if (setIsImpersonating) setIsImpersonating(true);
        
        navigate('/dashboard');
      } else {
        setError(t('auth.invalidToken') || 'Invalid or expired impersonation token');
      }
    } catch (err) {
      console.error('Auto-login error:', err.response?.data || err.message);
      setError(t('auth.invalidToken') || 'Invalid or expired impersonation token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login({ email, password }, 'tenant');

    if (result.success) {
      if (result.requires2FA) {
        setRequires2FA(true);
        setTwoFactorMethod(result.method || 'email');
        setIsLoading(false);
      } else {
        if (result.tenant_domain && result.tenant_domain !== window.location.host) {
            window.location.href = `http://${result.tenant_domain}/login?token=${result.token}&domain=${result.tenant_domain}`;
            return;
        }
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await verify2FA(email, twoFactorCode, twoFactorMethod, 'tenant');
    if (result.success) {
      if (result.tenant_domain && result.tenant_domain !== window.location.host) {
          window.location.href = `http://${result.tenant_domain}/login?token=${result.token}&domain=${result.tenant_domain}`;
          return;
      }
      navigate('/dashboard');
    } else {
      setError(result.error || "Invalid verification code.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10"
      >
        {/* Branding Wrapper */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20 ring-1 ring-white/20"
          >
            {settings.platform_logo_url ? (
               <img src={settings.platform_logo_url} alt={settings.platform_name} className="w-12 h-12 object-contain" />
            ) : (
               businessName ? <Store className="w-10 h-10" /> : <Sparkles className="w-10 h-10" />
            )}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-white tracking-tight"
          >
            {businessName || settings.platform_name || 'Partner Portal'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 mt-3 font-medium"
          >
            {requires2FA ? t('auth.twoFactor') : t('auth.signInToContinue')}
          </motion.p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[32px] p-8 md:p-10 shadow-2xl relative group overflow-hidden">
          {/* Subtle top light */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

          <AnimatePresence mode="wait">
            {!requires2FA ? (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin} 
                className="space-y-6"
              >
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0"></div>
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.email')}</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@business.com"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-700 font-medium" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.password')}</label>
                    <Link to="/forgot-password" title={t('auth.forgotPassword')} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">{t('auth.forgotPassword')}</Link>
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
                    <input 
                      required
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-700 font-medium" 
                    />
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t('auth.login')}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="pt-6 border-t border-slate-800 flex flex-col items-center gap-4">
                  <p className="text-slate-500 text-xs font-medium text-center">
                    {t('auth.newToPlatform')} {' '}
                    <Link to="/register" className="text-white font-bold hover:text-blue-400 transition-colors inline-flex items-center gap-1 group/link">
                      {t('auth.register')} <UserPlus className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </p>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="2fa-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerify2FA} 
                className="space-y-6"
              >
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{t('auth.enterCode')}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {t('auth.twoFactorDesc')}
                    </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 font-medium">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></div>
                    {error}
                  </div>
                )}

                <div className="space-y-2 text-center">
                  <input 
                    required
                    type="text" 
                    maxLength="6"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-800" 
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('common.submit')}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setRequires2FA(false)}
                      className="text-slate-500 hover:text-white text-xs font-bold transition-colors uppercase tracking-widest"
                    >
                       {t('common.back')}
                    </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer info */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em]"
        >
          Secure Infrastructure Provided by {settings.platform_name || 'Resevit'} Cloud
        </motion.p>
      </motion.div>
    </div>
  );
}
