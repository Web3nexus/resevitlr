import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Building2, CreditCard, PackageOpen, MessageSquare, Mail, Shield, BookOpen, Globe, Settings, Users, LogOut, Bell, AlertTriangle, CheckCircle, Menu, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { useBranding } from '../hooks/useBranding';
import LanguageSwitcher from '../components/LanguageSwitcher';

export function SaaSAdminLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(20000);
  const settings = useBranding();

  // Register inactivity logout monitoring
  useInactivityLogout();

  const navItems = [
    { name: t('admin.overview'), path: '/securegate/dashboard', icon: LayoutDashboard },
    { name: t('admin.tenants'), path: '/securegate/tenants', icon: Building2 },
    { name: t('admin.subscriptions'), path: '/securegate/subscriptions', icon: CreditCard },
    { name: 'Plan Management', path: '/securegate/plans', icon: PackageOpen },
    { name: t('admin.support'), path: '/securegate/tickets', icon: MessageSquare },
    { name: t('admin.emailHub'), path: '/securegate/email-templates', icon: Mail },
    { name: 'Admin Management', path: '/securegate/admins', icon: Shield },
    { name: t('admin.contentLandingPage'), path: '/securegate/cms', icon: BookOpen },
    { name: 'Translations', path: '/securegate/translations', icon: Globe },
    { name: t('admin.systemSettings'), path: '/securegate/settings', icon: Settings },
    { name: t('admin.myAccount'), path: '/securegate/account', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] flex text-[#94a3b8]">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`border-r border-foreground bg-[#020617] flex flex-col h-screen fixed lg:sticky top-0 z-50 transition-all duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-4 md:p-6 border-b border-foreground flex items-center justify-between lg:justify-center hover:bg-[#0f172a] transition-colors`}>
           <Link to="/securegate/dashboard" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`} onClick={() => setIsMobileSidebarOpen(false)}>
              {settings.platform_logo_url ? (
                 <img src={settings.platform_logo_url} alt={settings.platform_name} className={`h-8 w-auto object-contain ${isSidebarCollapsed ? 'mx-auto' : ''}`} />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center ring-2 ring-blue-600/20 shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <h1 className="text-white font-bold tracking-tight truncate">{settings.platform_name}</h1>
                  <p className="text-[10px] text-[#64748b] uppercase tracking-widest font-semibold shrink-0">Super Admin Control</p>
                </div>
              )}
           </Link>
           <button className="lg:hidden text-slate-400 hover:text-white shrink-0" onClick={() => setIsMobileSidebarOpen(false)}>
              <X size={20} />
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                title={item.name}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl transition-all overflow-hidden ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 font-medium' 
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-slate-800 flex ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
          <Link to="/securegate" className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors text-slate-400 w-full`} title={t('auth.logout')}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">{t('auth.logout')}</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b-2 border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 border-b-blue-500/50">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsMobileSidebarOpen(true)}>
                  <Menu size={24} />
                </button>
                <button className="hidden lg:block p-2 text-slate-500 hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                  <Menu size={24} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold text-white leading-none">
                       {navItems.find(i => i.path === location.pathname)?.name || 'Control Panel'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">System Infrastructure</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-xl border transition-all ${showNotifications ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute right-0 mt-3 w-80 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-4 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                                <div className="flex justify-between items-center mb-4 px-1">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Alerts</h3>
                                    {unreadCount > 0 && <span className="text-[10px] text-blue-400 font-bold">{unreadCount} NEW</span>}
                                </div>
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-10">
                                            <Bell className="w-8 h-8 text-slate-800 mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hub Clear</p>
                                        </div>
                                    ) : (Array.isArray(notifications) ? notifications : []).map(n => (
                                        <button 
                                            key={n.id} 
                                            onClick={() => { markRead(n.id); }}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${n.status === 'unread' ? 'bg-blue-600/5 border-blue-500/20' : 'bg-slate-950/50 border-slate-800'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 p-1 rounded-lg ${n.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {n.type === 'error' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-200 leading-tight mb-0.5">{n.title}</div>
                                                    <div className="text-[10px] text-slate-500 leading-normal">{n.message}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={markAllRead} 
                                        className="w-full mt-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors border-t border-slate-800 pt-3"
                                    >
                                        {t('common.markAllRead')}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <span className="text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    System Operational
                </span>
            </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 relative">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
