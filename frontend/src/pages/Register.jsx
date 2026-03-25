import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Building2, Mail, Lock, User, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../hooks/useBranding';
import api from '../services/api';
import { COUNTRIES } from '../utils/countries';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const settings = useBranding();
  // Forced update to clear potential Vite build cache
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [accountType, setAccountType] = useState('owner');
  
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    password: '',
    country: 'NG'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('auth/register', { 
        ...formData, 
        turnstile_token: turnstileToken 
      });
      if (response.data.success) {
        setIsSuccess(true);
        // Auto-login: store token and user from registration response
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('auth_user', JSON.stringify(response.data.user));
          localStorage.setItem('tenant_domain', response.data.domain);
        }
        // Redirect directly to dashboard after a brief success animation
        setTimeout(() => {
          const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
          window.location.href = `${protocol}//${response.data.domain}/dashboard`;
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
      // If error occurs, stay on step 3 or move back to error-relevant step if needed
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    })
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full py-12">
        
        {/* Left Side: Branding & Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            {settings.platform_logo_url ? (
               <img src={settings.platform_logo_url} alt={settings.platform_name} className="h-12 w-auto object-contain" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black text-white tracking-tighter uppercase italic">{settings.platform_name || 'Resevit'}</span>
              </>
            )}
          </Link>

          <h2 className="text-6xl font-black text-white leading-[1.1] mb-8">
            {t('register.hero_title').split('Future of Business')[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Future of Business</span>{t('register.hero_title').split('Future of Business')[1]}
          </h2>
          <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-lg font-medium">
            {t('register.hero_subtitle')}
          </p>

          <div className="grid grid-cols-2 gap-8 max-w-lg">
            {[
              { title: t('register.feature_global_title'), desc: t('register.feature_global_desc'), icon: Globe },
              { title: t('register.feature_ai_title'), desc: t('register.feature_ai_desc'), icon: Sparkles }
            ].map((item, id) => (
              <div key={id} className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shadow-lg">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="text-white font-bold text-sm tracking-tight">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Form Wizard */}
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            {/* Top accent light */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div key="wizard-content" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                  {/* Progress Header */}
                  <div className="mb-10 text-center">
                    <div className="flex justify-center items-center gap-3 mb-6">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${currentStep >= s ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-slate-800'}`}></div>
                          {s < 3 && <div className={`w-8 h-[2px] rounded-full transition-all duration-700 ${currentStep > s ? 'bg-blue-500' : 'bg-slate-800'}`}></div>}
                        </div>
                      ))}
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">
                      {currentStep === 1 ? t('register.step_title_1') : currentStep === 2 ? t('register.step_title_2') : t('register.step_title_3')}
                    </h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{t('common.step')} {currentStep} {t('common.of')} 3</p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center gap-3 font-medium">
                      <div className="shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleRegister} className="relative min-h-[320px] flex flex-col justify-between">
                    <AnimatePresence mode="wait" custom={currentStep}>
                      <motion.div
                        key={currentStep}
                        custom={currentStep}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                      >
                        {currentStep === 1 && (
                          <div className="space-y-5">
                            <div className="space-y-2 mb-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Account Type</label>
                              <div className="flex gap-4">
                                <button type="button" onClick={() => setAccountType('owner')} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${accountType === 'owner' ? 'bg-blue-500/10 border border-blue-500/50 text-blue-400 ring-4 ring-blue-500/10' : 'bg-slate-950/50 border border-slate-800/80 text-slate-500 hover:text-white'}`}>Business Owner</button>
                                <button type="button" onClick={() => setAccountType('staff')} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${accountType === 'staff' ? 'bg-indigo-500/10 border border-indigo-500/50 text-indigo-400 ring-4 ring-indigo-500/10' : 'bg-slate-950/50 border border-slate-800/80 text-slate-500 hover:text-white'}`}>Staff Member</button>
                              </div>
                            </div>

                            {accountType === 'staff' ? (
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80 p-6">
                                 <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-4" />
                                 <h4 className="text-white font-black mb-2 text-sm uppercase tracking-tight">Staff Registration Restricted</h4>
                                 <p className="text-xs text-slate-400 leading-relaxed font-medium">Waitstaff, managers, and kitchen staff accounts are provisioned directly by your restaurant's management layer. Please contact your HR or Business Owner for your secure login link.</p>
                               </motion.div>
                            ) : (
                              <>
                                <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t('staff.name')}</label>
                              <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/input:text-blue-400 transition-colors" />
                                <input 
                                  required
                                  type="text" 
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  placeholder="John Doe"
                                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-slate-800 font-medium" 
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t('auth.email')}</label>
                              <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/input:text-blue-400 transition-colors" />
                                <input 
                                  required
                                  type="email" 
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  placeholder="john@example.com"
                                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-slate-800 font-medium" 
                                />
                              </div>
                            </div>
                          </>
                          )}
                        </div>
                      )}

                        {currentStep === 2 && (
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t('settings.restaurantName')}</label>
                              <div className="relative group/input">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/input:text-blue-400 transition-colors" />
                                <input 
                                  required
                                  type="text" 
                                  name="business_name"
                                  value={formData.business_name}
                                  onChange={handleChange}
                                  placeholder="My Venture"
                                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-slate-800 font-medium" 
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t('settings.address')}</label>
                              <div 
                                className="relative group/input" 
                                tabIndex={0} 
                                onBlur={(e) => { 
                                  if (!e.currentTarget.contains(e.relatedTarget)) {
                                    setIsCountryOpen(false);
                                  } 
                                }}
                              >
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/input:text-blue-400 transition-colors z-10 pointer-events-none" />
                                
                                <div 
                                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-12 pr-10 text-white transition-all font-medium flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 group-focus-within/input:border-blue-500/50 group-focus-within/input:ring-2 group-focus-within/input:ring-blue-500/30"
                                >
                                  <span className="truncate">{COUNTRIES.find(c => c.code === formData.country)?.name || 'Select Country'}</span>
                                  <div className={`text-slate-600 transition-transform duration-200 pointer-events-none ${isCountryOpen ? '-rotate-90' : 'rotate-90'}`}>
                                    <ArrowRight className="w-4 h-4" />
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {isCountryOpen && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl py-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                                    >
                                      {COUNTRIES.map(country => (
                                        <button
                                          key={country.code}
                                          type="button"
                                          onClick={() => {
                                            handleChange({ target: { name: 'country', value: country.code }});
                                            setIsCountryOpen(false);
                                          }}
                                          className={`w-full text-left px-5 py-3 hover:bg-slate-800 transition-colors text-sm font-medium ${formData.country === country.code ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'}`}
                                        >
                                          {country.name}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t('auth.password')}</label>
                              <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/input:text-blue-400 transition-colors" />
                                <input 
                                  required
                                  type="password" 
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  placeholder="••••••••"
                                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-slate-800 font-medium" 
                                />
                              </div>
                              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest ml-1 mt-2">{t('auth.password_hint')}</p>
                            </div>

                            <div className="flex justify-center mt-6">
                              <Turnstile 
                                siteKey={settings.turnstile_site_key || import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                                onSuccess={(token) => setTurnstileToken(token)}
                                options={{ theme: 'dark' }}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-4 mt-12">
                      {currentStep > 1 && (
                        <button 
                          type="button" 
                          onClick={prevStep}
                          className="flex-1 border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-95"
                        >
                          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                          {t('common.back', 'Back')}
                        </button>
                      )}
                      
                      {currentStep < 3 ? (
                        <button 
                          type="button" 
                          onClick={nextStep}
                          disabled={currentStep === 1 ? (accountType === 'staff' || !formData.name || !formData.email) : (!formData.business_name)}
                          className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group active:scale-95"
                        >
                          {t('common.continue', 'Continue')}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <button 
                          type="submit"
                          disabled={isLoading || !formData.password || !turnstileToken}
                          className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95"
                        >
                          {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          ) : (
                            <>
                               {t('common.submit', 'Submit')}
                              <CheckCircle2 className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="mt-10 text-center border-t border-slate-800/50 pt-8">
                    <p className="text-slate-500 text-xs font-medium">
                      {t('auth.already_have_account')} {' '}
                      <Link to="/login" className="text-white font-bold hover:text-blue-400 transition-colors tracking-tight">{t('auth.login')}</Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                   <h3 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase italic">{t('register.success_title')}</h3>
                   <p className="text-slate-400 leading-relaxed mb-10 font-medium">
                     {t('register.success_body')}
                   </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="text-center mt-10 text-[10px] text-slate-700 font-black uppercase tracking-[0.25em] max-w-sm mx-auto select-none">
            End-to-End Encryption Enabled
          </p>
        </div>
      </div>

      {/* Footer Branding Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-800 font-black text-[10vw] select-none pointer-events-none opacity-[0.02] uppercase tracking-tighter italic">
        {settings.platform_name || 'Resevit'} Engineering
      </div>
    </div>
  );
}
