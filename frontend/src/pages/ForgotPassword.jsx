import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    
    try {
      // Determine if we are on a tenant domain or central
      const isCentral = !window.location.hostname.includes('.') || 
                        window.location.hostname.includes('localhost') ||
                        window.location.pathname.startsWith('/securegate');
      
      const baseURL = isCentral ? '/central-api' : api.defaults.baseURL;
      
      const response = await api.post('/forgot-password', { email }, { baseURL });
      
      setStatus('success');
      setMessage(response.data.message || 'If your email is in our system, you will receive a reset link shortly.');
    } catch (error) {
      console.error('Password reset request failed:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to send reset link. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('forgot_password_title', 'Forgot Password')}</h1>
          <p className="text-slate-500 text-center mt-2">
            {t('forgot_password_subtitle', 'Enter your email address and we\'ll send you a link to reset your password.')}
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{message}</p>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/10"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back_to_login', 'Back to Login')}
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
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">
                {t('email_label', 'Email Address')}
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('send_reset_link', 'Send Reset Link')}
                </>
              )}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back_to_login', 'Back to Login')}
            </Link>
          </form>
        )}
      </div>

      <p className="mt-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Resevit. {t('all_rights_reserved', 'All rights reserved.')}
      </p>
    </div>
  );
}
