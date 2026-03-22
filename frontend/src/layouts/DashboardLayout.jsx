import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Calendar, MessageSquare, Component, Utensils, Table, Users, DollarSign, CreditCard, Bot, Settings, Plus, LogOut, User, Shield, Bell, CheckCircle, CircleX as XCircle, ShoppingBag } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { useBranding } from '../hooks/useBranding';
import LanguageSwitcher from '../components/LanguageSwitcher';

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(15000);
  const { user, logout, isImpersonating, stopImpersonating } = useAuth();
  const settings = useBranding();
  
  // Register inactivity logout monitoring
  useInactivityLogout();
  
  const isActive = (path) => location.pathname === path;

  const navItemClass = (path) => `flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-sm ${
    isActive(path) 
      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
      : 'text-slate-400 hover:text-white hover:bg-slate-800'
  }`;
  
  const hasFeature = (feat) => {
    if (!user?.features) return true; // Default to true if not loaded yet to avoid flickering
    return user.features.includes(feat);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shadow-2xl z-20 border-r border-slate-800">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-10 px-2 pt-4">
            {settings.platform_logo_url ? (
              <img src={settings.platform_logo_url} alt={settings.platform_name} className="h-8 w-auto object-contain" />
            ) : (
              <div className="bg-blue-600 text-white p-1.5 rounded-xl shadow-lg shadow-blue-500/20">
                <span className="font-black text-xl leading-none">{settings.platform_name?.charAt(0) || 'R'}</span>
              </div>
            )}
            <h2 className="text-xl font-black text-white tracking-tighter">{settings.platform_name}</h2>
          </div>
          <nav className="space-y-1">
            <Link to="/dashboard" className={navItemClass('/dashboard')}><LayoutDashboard size={18} /> {t('dashboard.insights')}</Link>
            <Link to="/dashboard/reservations" className={navItemClass('/dashboard/reservations')}><Calendar size={18} /> {t('dashboard.reservations')}</Link>
            
            {(user?.role === 'owner' || user?.role === 'restaurant_owner') && hasFeature('social_integration') && (
              <Link to="/dashboard/messages" className={navItemClass('/dashboard/messages')}><MessageSquare size={18} /> {t('dashboard.unifiedChat')}</Link>
            )}

            <Link to="/dashboard/pos" className={navItemClass('/dashboard/pos')}><Component size={18} /> {t('dashboard.posTerminal')}</Link>
            <Link to="/dashboard/menu" className={navItemClass('/dashboard/menu')}><Utensils size={18} /> {t('dashboard.menuBuilder')}</Link>
            <Link to="/dashboard/tables" className={navItemClass('/dashboard/tables')}><Table size={18} /> {t('dashboard.floorPlan')}</Link>
            
            {(user?.role === 'owner' || user?.role === 'restaurant_owner') && (
              <>
                <Link to="/dashboard/staff" className={navItemClass('/dashboard/staff')}><Users size={18} /> {t('dashboard.staffProfiles')}</Link>
                
                {hasFeature('financial_reports') ? (
                  <Link to="/dashboard/financials" className={navItemClass('/dashboard/financials')}><DollarSign size={18} /> {t('dashboard.financials')}</Link>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600 cursor-not-allowed opacity-50 grayscale">
                    <DollarSign size={18} /> {t('dashboard.financials')} <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-bold">PRO</span>
                  </div>
                )}

                <Link to="/dashboard/billing" className={navItemClass('/dashboard/billing')}>
                  <CreditCard size={18} /> {t('dashboard.billingPlan') || 'Billing & Plan'}
                </Link>
                
                {hasFeature('ai_automation') ? (
                  <Link to="/dashboard/automation" className={navItemClass('/dashboard/automation')}><Bot size={18} /> {t('dashboard.aiCommand')}</Link>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg text-slate-600 cursor-not-allowed opacity-50 grayscale">
                    <Bot size={18} /> {t('dashboard.aiCommand')} <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-bold">PRO+</span>
                  </div>
                )}
                
                <Link to="/dashboard/settings" className={navItemClass('/dashboard/settings')}><Settings size={18} /> {t('dashboard.configuration')}</Link>
                <Link to="/dashboard/onboarding" className={navItemClass('/dashboard/onboarding')}><Plus size={18} /> {t('dashboard.provisioning')}</Link>
              </>
            )}
          </nav>
        </div>
        <div className="p-6 border-t border-slate-800">
           <button onClick={logout} className="flex items-center gap-2 text-slate-500 hover:text-red-400 w-full font-medium transition-colors">
             <LogOut size={18} /> {t('dashboard.logout')}
           </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-amber-500 text-white px-8 py-2 flex items-center justify-between shadow-md z-40 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
               <div className="p-1.5 bg-white/20 rounded-lg">
                  <User size={16} />
               </div>
               <div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{t('dashboard.impersonation.active')}</span>
                   <p className="text-xs font-bold leading-none">{t('dashboard.impersonation.logged_as', { name: user?.name || 'Owner' })}</p>
               </div>
            </div>
            <button 
              onClick={() => {
                stopImpersonating();
                window.location.href = '/securegate/tenants';
              }}
              className="px-4 py-1.5 bg-white text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-sm"
            >
               {t('dashboard.impersonation.terminate')}
            </button>
          </div>
        )}

        {/* Setup 2FA Banner */}
        {user?.two_factor_method === 'none' && !sessionStorage.getItem('dismissed_2fa_prompt') && (
          <div className="bg-blue-600 text-white px-8 py-3 flex items-center justify-between shadow-md z-30 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
               <div className="p-1.5 bg-white/20 rounded-lg">
                  <Shield size={16} />
               </div>
               <div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{t('dashboard.security_prompt.title')}</span>
                   <p className="text-xs font-bold leading-none mt-0.5">{t('dashboard.security_prompt.body')}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard/settings"
                onClick={() => sessionStorage.setItem('dismissed_2fa_prompt', 'true')}
                className="px-4 py-1.5 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
              >
                 {t('dashboard.security_prompt.button')}
              </Link>
              <button 
                onClick={(e) => {
                  e.currentTarget.parentElement.parentElement.style.display = 'none';
                  sessionStorage.setItem('dismissed_2fa_prompt', 'true');
                }}
                className="text-white/60 hover:text-white transition-colors"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className={`h-20 bg-white border-b-2 flex justify-between items-center px-8 shadow-sm z-30 ${
          user?.role === 'owner' ? 'border-b-emerald-500/20' : 'border-b-amber-500/20'
        }`}>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                {settings.platform_name?.split(' ')[0] || 'ENGINE'} <span className="text-blue-600">{settings.platform_name?.split(' ')[1] || 'OVERVIEW'}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
                 {user?.role === 'owner' ? (
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-200">{t('dashboard.mgmt_business')}</span>
                 ) : (
                    <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">{t('dashboard.role_staff')}</span>
                 )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <LanguageSwitcher />
             {/* Notifications */}
             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-all ${showNotifications ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  <Bell size={22} />
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-4 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center px-2">
                          {t('common.notifications')}
                           {unreadCount > 0 && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px]">{unreadCount} {t('common.new')}</span>}
                       </h3>
                       <div className="space-y-2 max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-center py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('common.noNotifications')}</p>
                          ) : notifications.map(n => (
                            <NotificationItem key={n.id} notification={n} onRead={() => markRead(n.id)} />
                          ))}
                       </div>
                       {notifications.length > 0 && (
                         <button onClick={markAllRead} className="w-full mt-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                           {t('common.markAllRead')}
                         </button>
                       )}
                    </div>
                  </>
                )}
             </div>

             {/* Profile Menu */}
             <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 group"
                >
                  <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                     A
                  </div>
                  <div className="text-left hidden lg:block">
                     <div className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none mb-0.5">{user?.name || 'Staff User'}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user?.role === 'owner' ? t('dashboard.role_admin') : t('dashboard.role_staff')}</div>
                  </div>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 z-50 animate-in slide-in-from-top-2 duration-300 origin-top-right">
                       <div className="p-4 border-b border-slate-50 mb-2">
                          <div className="font-black text-slate-900 text-sm uppercase">{user?.name || 'Staff User'}</div>
                          <div className="text-[10px] text-slate-400 font-bold tracking-tight">{user?.email || 'user@resevit.test'}</div>
                       </div>
                       <div className="space-y-1">
                          {user?.role === 'owner' && (
                            <>
                              <button 
                                onClick={() => { navigate('/dashboard/settings'); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors group"
                              >
                                 <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors"><Settings size={16} /></div>
                                 <span className="text-[10px] font-black uppercase tracking-widest">{t('settings.title')}</span>
                              </button>
                              <button 
                                onClick={() => { navigate('/dashboard/account'); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors group"
                              >
                                 <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors"><User size={16} /></div>
                                 <span className="text-[10px] font-black uppercase tracking-widest">{t('common.profile')}</span>
                              </button>
                            </>
                          )}
                       </div>
                       <div className="mt-2 pt-2 border-t border-slate-50">
                          <button onClick={() => { logout(); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors group">
                            <LogOut size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('auth.logout')}</span>
                          </button>
                       </div>
                    </div>
                  </>
                )}
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NotificationItem({ notification, onRead }) {
  const iconMap = {
    order: <ShoppingBag size={14} className="text-blue-500" />,
    reservation: <Calendar size={14} className="text-emerald-500" />,
    'check-circle': <CheckCircle size={14} className="text-emerald-500" />,
    'x-circle': <XCircle size={14} className="text-red-500" />,
  };
  const icon = iconMap[notification.icon] || iconMap[notification.type] || <Bell size={14} className="text-slate-400" />;
  const isUnread = notification.status === 'unread';

   const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t('dashboard.time.just_now');
    if (m < 60) return t('dashboard.time.minutes_ago', { count: m });
    const h = Math.floor(m / 60);
    if (h < 24) return t('dashboard.time.hours_ago', { count: h });
    return t('dashboard.time.days_ago', { count: Math.floor(h / 24) });
  };

  return (
    <div
      onClick={onRead}
      className={`flex items-center gap-3 p-3 rounded-2xl group transition-all cursor-pointer border ${
        isUnread ? 'bg-blue-50/50 border-blue-100 hover:border-blue-200' : 'bg-white border-slate-50 hover:border-slate-100'
      }`}
    >
      <div className={`p-2 rounded-xl group-hover:bg-blue-50 transition-colors ${isUnread ? 'bg-blue-100' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black text-slate-800 tracking-tight leading-tight truncate">{notification.title}</div>
        <div className="text-[9px] font-bold text-slate-400 mt-0.5 truncate">{notification.message}</div>
        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">{timeAgo(notification.created_at)}</div>
      </div>
      {isUnread && <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0"></div>}
    </div>
  );
}
