import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../hooks/useBranding';

import { useTranslation } from 'react-i18next';

export default function SecuregateLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, verify2FA } = useAuth();
  const settings = useBranding();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login({ email, password }, 'admin');
    
    if (result.success) {
      if (result.requires2FA) {
        setRequires2FA(true);
        setTwoFactorMethod(result.method || 'email');
        setIsLoading(false);
      } else {
        navigate('/securegate/dashboard');
      }
    } else {
      setError(result.error || t('auth.error'));
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await verify2FA(email, twoFactorCode, twoFactorMethod, 'admin');
    if (result.success) {
      navigate('/securegate/dashboard');
    } else {
      setError(result.error || t('auth.error'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-10 flex flex-col items-center">
          {settings.platform_logo_url ? (
             <img src={settings.platform_logo_url} alt={settings.platform_name} className="h-16 w-auto object-contain mb-6" />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 ring-4 ring-slate-800">
              <Shield className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('auth.adminLogin.title')}</h1>
          <p className="text-slate-400 mt-2">{t('auth.adminLogin.subtitle')}</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden">
          {/* Top Edge Highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-blue-500 to-emerald-400"></div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {!requires2FA ? (
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.adminLogin.adminIdentity')}</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    placeholder="admin@resevit.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('auth.adminLogin.passkey')}</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 pr-12"
                    placeholder="••••••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('auth.adminLogin.authenticate')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                  {twoFactorMethod === 'pin' ? t('auth.adminLogin.securityPin') : 
                   twoFactorMethod === 'totp' ? t('auth.adminLogin.authCode') : t('auth.adminLogin.verifyCode')}
                </label>
                <p className="text-xs text-slate-500 text-center mb-4">
                  {twoFactorMethod === 'pin' ? t('auth.adminLogin.enterPin') : 
                   twoFactorMethod === 'totp' ? t('auth.adminLogin.enterAuthCode') : t('auth.adminLogin.enteringCode', { email })}
                </p>
                <input
                  type={twoFactorMethod === 'pin' ? 'password' : 'text'}
                  required
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-4 px-4 text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('auth.adminLogin.verifyAccess')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
              >
                {t('auth.adminLogin.backToIdentity')}
              </button>
            </form>
          )}
        </div>
        
        {/* Footer Warning */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
           <Lock className="w-3 h-3" /> {t('auth.adminLogin.restrictedAccess')}
        </div>
      </div>
    </div>
  );
}
