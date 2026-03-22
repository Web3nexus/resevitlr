import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ChevronDown, Sparkles, Book, Star, FileText, HelpCircle, Users, MessageCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../hooks/useBranding';
import LanguageSwitcher from '../components/LanguageSwitcher';

export function PublicLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const settings = useBranding();
  const location = useLocation();

  let hideTimeout;
  const handleMouseEnter = () => {
    clearTimeout(hideTimeout);
    setResourcesOpen(true);
  };
  const handleMouseLeave = () => {
    hideTimeout = setTimeout(() => {
      setResourcesOpen(false);
    }, 200); // Small delay to prevent jitter
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0); // Reset scroll on navigation
  }, [location.pathname]);

  const navLinks = [
    { name: t('nav.features'), path: '/features' },
    { name: t('nav.pricing'), path: '/pricing' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 py-3 shadow-2xl shadow-black/50' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            {settings.platform_logo_url ? (
              <img src={settings.platform_logo_url} alt={settings.platform_name || 'Logo'} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">{settings.platform_name || 'Resevit'}</span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Resources Mega Menu */}
            <div 
              className="relative py-4"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {t('nav.docs')} <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${resourcesOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full -left-24 w-[600px] pt-2"
                  >
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden relative">
                      {/* Glow effect */}
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                      
                      <div className="grid grid-cols-2 gap-4 p-6">
                        {[
                          { title: t('nav.blog'), desc: t('hero.subtitle').split('.')[0], icon: Book, path: '/blog', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                          { title: 'Success Stories', desc: 'See how restaurants win with us', icon: Star, path: '/customers', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                          { title: t('nav.docs'), desc: 'Step-by-step setup manuals', icon: FileText, path: '/docs', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                          { title: 'Help Center', desc: 'Quick answers and tutorials', icon: HelpCircle, path: '/help', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                          { title: 'About Us', desc: 'Our mission and the team', icon: Users, path: '/about', color: 'text-rose-400', bg: 'bg-rose-500/10' },
                          { title: t('nav.community'), desc: 'Join the restaurant owners club', icon: MessageCircle, path: '/community', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        ].map((item, idx) => (
                          <Link 
                            key={idx} 
                            to={item.path}
                            onClick={() => setResourcesOpen(false)}
                            className="group flex gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-colors"
                          >
                            <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${item.bg}`}>
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      
                      <div className="bg-slate-950 p-6 flex items-center justify-between border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-slate-300">Resevit Status: Platform Healthy</span>
                        </div>
                        <Link to="/help" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            Visit Support <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && (
              user ? (
                <Link 
                  to={user.role === 'admin' ? '/securegate/dashboard' : '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center gap-2 group"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <LanguageSwitcher />
                  <Link to="/login" className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                    {t('nav.login')}
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-white hover:bg-slate-100 text-slate-950 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-white/10 hover:shadow-white/20"
                  >
                    {t('nav.getStarted')}
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-slate-950 pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className="text-2xl font-semibold text-white tracking-tight"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-800 w-full my-4"></div>
              {!loading && (
                user ? (
                  <Link 
                    to={user.role === 'admin' ? '/securegate/dashboard' : '/dashboard'}
                    className="w-full bg-blue-600 text-white text-center py-4 rounded-2xl font-semibold text-lg"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link 
                      to="/login"
                      className="w-full bg-slate-900 border border-slate-800 text-white text-center py-4 rounded-2xl font-semibold text-lg"
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/register"
                      className="w-full bg-white text-slate-950 text-center py-4 rounded-2xl font-semibold text-lg"
                    >
                      Get Started Free
                    </Link>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="flex-1 relative pt-20"> {/* pt-20 accounts for fixed header */}
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/50 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                {settings.platform_logo_url ? (
                  <img src={settings.platform_logo_url} alt={settings.platform_name || 'Logo'} className="h-8 w-auto object-contain" />
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">{settings.platform_name || 'Resevit'}</span>
                  </>
                )}
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                The next-generation operating system for modern restaurants. Manage reservations, menus, and staff with built-in intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-4">
                <li><Link to="/features" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Pricing</Link></li>
                <li><Link to="/login" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">{t('nav.docs').split(' ')[0]}</h4>
              <ul className="space-y-4">
                <li><Link to="/docs" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">{t('nav.docs')}</Link></li>
                <li><Link to="/help" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Help Center</Link></li>
                <li><Link to="/blog" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">{t('nav.blog')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Community</h4>
              <ul className="space-y-4">
                <li><a href={settings.whatsapp_channel_url || "#"} className="text-sm text-slate-500 hover:text-blue-400 transition-colors">WhatsApp Channel</a></li>
                <li><a href={settings.instagram_url || "#"} className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Instagram</a></li>
                <li><a href={settings.facebook_url || "#"} className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Facebook Group</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} {settings.platform_name || 'Resevit'}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className="text-xs text-slate-600 hover:text-white transition-colors">About Us</Link>
              <a href="#" className="text-xs text-slate-600 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-600 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
