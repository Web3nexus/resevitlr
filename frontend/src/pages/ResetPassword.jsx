import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    
    if (!tokenParam || !emailParam) {
      setStatus('error');
      setMessage('Invalid or missing password reset link. Please request a new one.');
    } else {
      setToken(tokenParam);
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setStatus('loading');

    try {
      const isCentral = !window.location.hostname.includes('.') || 
                        window.location.hostname.includes('localhost') ||
                        window.location.pathname.startsWith('/securegate');
      
      const baseURL = isCentral ? '/central-api' : api.defaults.baseURL;
      
      const response = await api.post('reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      }, { baseURL });

      setStatus('success');
      setMessage(response.data.message || 'Password reset successfully.');
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset failed:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('reset_password_title', 'Create New Password')}</h1>
          <p className="text-slate-500 text-center mt-2">
            {t('reset_password_subtitle', 'Choose a strong password for your account.')}
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold">{message}</p>
                <p className="text-sm text-green-600">Redirecting to login page in 3 seconds...</p>
              </div>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/10"
            >
              {t('go_to_login', 'Go to Login')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                {t('email_label', 'Email Address')}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">
                {t('new_password', 'New Password')}
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password_confirmation" className="text-sm font-semibold text-slate-700 ml-1">
                {t('confirm_new_password', 'Confirm New Password')}
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || status === 'error'}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('reset_password_btn', 'Reset Password')}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium py-2"
            >
              {t('back_to_login', 'Back to Login')}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
