import React, { useState, useEffect } from 'react'
import { User, Shield, Bell, Globe, Eye, EyeOff, Save, Check, Loader2, AlertTriangle } from 'lucide-react'
import api from '../services/api'
import centralApi from '../services/centralApi'
import { useTranslation } from 'react-i18next'

const TABS = [
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'security', label: 'Security & Auth', icon: Shield },
  { id: 'notifications', label: 'Notification HUB', icon: Bell },
  { id: 'language', label: 'Language', icon: Globe },
]

export default function AccountSettingsView() {
  const isSaaS = window.location.pathname.startsWith('/securegate');
  const activeApi = isSaaS ? centralApi : api;
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const [profile, setProfile] = useState({ name: '', email: '' })
  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  
  const [twoFactorMethod, setTwoFactorMethod] = useState('none');
  const [setupMode, setSetupMode] = useState(null); // 'totp' or 'pin'
  const [setupData, setSetupData] = useState({ secret: '', qr_code: '', code: '', pin: '', pin_confirmation: '' });

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const res = await activeApi.get('/profile');
            setProfile({ name: res.data.name, email: res.data.email });
            setTwoFactorMethod(res.data.two_factor_method || 'none');
        } catch (err) {
            console.error("Profile fetch failed", err);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, [activeApi]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await activeApi.get('/profile/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchSessions();
    }
  }, [activeTab, activeApi]);

  const handleRevokeSession = async (id) => {
    try {
      await activeApi.delete(`/profile/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError("Failed to revoke session.");
    }
  };

  const handleUpdate2faMethod = async (method) => {
    if (method === 'totp' && twoFactorMethod !== 'totp') {
      setSetupMode('totp');
      const res = await activeApi.post('/profile/2fa/totp/generate');
      setSetupData(prev => ({ ...prev, secret: res.data.secret, qr_code: res.data.qr_code }));
      return;
    }
    if (method === 'pin' && twoFactorMethod !== 'pin') {
      setSetupMode('pin');
      return;
    }

    try {
      await activeApi.post('/profile/2fa/method', { method });
      setTwoFactorMethod(method);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update 2FA method.");
    }
  };

  const handleVerifyTotp = async () => {
    setError(null);
    try {
      await activeApi.post('/profile/2fa/totp/verify', { secret: setupData.secret, code: setupData.code });
      setTwoFactorMethod('totp');
      setSetupMode(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Invalid Authenticator Code.");
    }
  };

  const handleSetPin = async () => {
    setError(null);
    try {
      await activeApi.post('/profile/2fa/pin', { pin: setupData.pin, pin_confirmation: setupData.pin_confirmation });
      setTwoFactorMethod('pin');
      setSetupMode(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set PIN. Make sure it's 6 digits and matches.");
    }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    try {
        await activeApi.post('/profile', profile);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    } catch (err) {
        setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
        setSaving(false);
    }
  };

  const handleRotatePassword = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    try {
        await activeApi.post('/profile/password', passwords);
        setSaved(true);
        setPasswords({ current_password: '', password: '', password_confirmation: '' });
        setTimeout(() => setSaved(false), 3000);
    } catch (err) {
        setError(err.response?.data?.message || "Failed to change password.");
    } finally {
        setSaving(false);
    }
  };

  const [notifPrefs, setNotifPrefs] = useState({
    new_order: true,
    new_reservation: true,
    reservation_confirmed: true,
    reservation_cancelled: true,
    expense_added: false,
    system_updates: false,
    // Admin specific
    new_signup: true,
    subscription_change: true,
    system_load: true,
    security_audit: true,
    database_sync: false,
  })

  const togglePref = (key) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError(null);
    try {
        await activeApi.post('/notifications/settings', notifPrefs);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    } catch (err) {
        setError(err.response?.data?.message || "Failed to save notification preferences.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2"><Loader2 className="animate-spin" /> Accessing Secure Node...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Account Infrastructure</h2>
        <p className="text-slate-400 font-bold text-sm">Manage personal security, authentication, and notification preferences.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in duration-300">
           <AlertTriangle size={18} />
           <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <aside className="space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Tab Content */}
        <div className="md:col-span-3 space-y-6">
          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-[28px] bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/20">
                    {profile.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-black text-slate-900 uppercase">{profile.name || 'User Profile'}</div>
                  <div className="text-[10px] text-slate-400 font-bold tracking-tight">Authenticated · {isSaaS ? 'Super Admin' : 'Business Owner'}</div>
                  <button className="mt-2 bg-white border-2 border-slate-100 px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:border-blue-600 transition-all">Change Avatar</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                        type="text" 
                        value={profile.name} 
                        onChange={e => setProfile({...profile, name: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 text-sm outline-none focus:border-blue-600 transition-all" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Auth Email</label>
                    <input 
                        type="email" 
                        value={profile.email} 
                        onChange={e => setProfile({...profile, email: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 text-sm outline-none focus:border-blue-600 transition-all" 
                    />
                </div>
              </div>

              <SaveButton saving={saving} saved={saved} onClick={handleUpdateProfile} />
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Password Rotation</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={passwords.current_password}
                        onChange={e => setPasswords({...passwords, current_password: e.target.value})}
                        placeholder="••••••••••" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 text-sm outline-none focus:border-blue-600 transition-all pr-12" 
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                      <input 
                        type="password" 
                        value={passwords.password}
                        onChange={e => setPasswords({...passwords, password: e.target.value})}
                        placeholder="••••••••••" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 text-sm outline-none focus:border-blue-600 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New</label>
                      <input 
                        type="password" 
                        value={passwords.password_confirmation}
                        onChange={e => setPasswords({...passwords, password_confirmation: e.target.value})}
                        placeholder="••••••••••" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-800 text-sm outline-none focus:border-blue-600 transition-all" 
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex gap-2 mb-5">
                    {['Strength', 'Length', 'Special Chars', 'Numbers'].map((s, i) => (
                      <div key={s} className={`h-1.5 flex-1 rounded-full ${i < 2 ? 'bg-amber-400' : 'bg-slate-100'}`}></div>
                    ))}
                  </div>
                  <SaveButton saving={saving} saved={saved} onClick={handleRotatePassword} label="Rotate Password" />
                </div>
              </div>

              {/* ── 2FA CONFIGURATION ── */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Two-Factor Authentication</h3>
                
                {!setupMode ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'none', label: 'Disabled', desc: 'Not recommended' },
                      { id: 'email', label: 'Email Code', desc: 'Receive via email' },
                      { id: 'totp', label: 'Authenticator', desc: 'Google/Authy App' },
                      { id: 'pin', label: 'Login PIN', desc: '6-digit secure PIN' }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleUpdate2faMethod(m.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${twoFactorMethod === m.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className={`font-black uppercase tracking-widest text-[10px] ${twoFactorMethod === m.id ? 'text-blue-700' : 'text-slate-700'}`}>{m.label}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-1">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                ) : setupMode === 'totp' ? (
                  <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-sm text-slate-800 uppercase">Set Up Authenticator</h4>
                    <p className="text-xs font-bold text-slate-500">Scan this code with Google Authenticator or Authy.</p>
                    {setupData.qr_code && <img src={setupData.qr_code} alt="QR Code" className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm" />}
                    <div className="space-y-2 max-w-xs pt-4">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter 6-Digit Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={setupData.code} 
                        onChange={e => setSetupData({...setupData, code: e.target.value})}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm outline-none focus:border-blue-600 transition-all text-center tracking-[0.5em]" 
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <SaveButton saving={saving} saved={saved} onClick={handleVerifyTotp} label="Verify & Enable" />
                      <button onClick={() => setSetupMode(null)} className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-md">
                    <h4 className="font-black text-sm text-slate-800 uppercase">Set Login PIN</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose 6-Digit PIN</label>
                        <input 
                          type="password" 
                          maxLength={6}
                          value={setupData.pin} 
                          onChange={e => setSetupData({...setupData, pin: e.target.value})}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm outline-none focus:border-blue-600 transition-all text-center tracking-[0.5em]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm PIN</label>
                        <input 
                          type="password" 
                          maxLength={6}
                          value={setupData.pin_confirmation} 
                          onChange={e => setSetupData({...setupData, pin_confirmation: e.target.value})}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm outline-none focus:border-blue-600 transition-all text-center tracking-[0.5em]" 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <SaveButton saving={saving} saved={saved} onClick={handleSetPin} label="Set PIN" />
                      <button onClick={() => setSetupMode(null)} className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Active Sessions</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authorised devices with access to your account</p>
                <div className="space-y-3">
                  {loadingSessions ? (
                    <div className="flex items-center gap-2 p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <Loader2 className="animate-spin w-3 h-3" /> Fetching active infrastructure tokens...
                    </div>
                  ) : sessions.length > 0 ? (
                    sessions.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-slate-100">
                            <Globe size={18} />
                          </div>
                          <div>
                            <div className="font-black text-xs text-slate-800 uppercase flex items-center gap-2">
                              {s.device || 'Authorised Device'}
                              {s.is_current && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px]">Current</span>}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{s.location} · {s.last_active}</div>
                          </div>
                        </div>
                        {!s.is_current && (
                          <button 
                            onClick={() => handleRevokeSession(s.id)}
                            className="text-[9px] font-black text-red-400 uppercase tracking-widest hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No other active sessions detected.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notifications' && (
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Notification Preferences</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Choose which events trigger alerts in your hub.</p>
              </div>
              <div className="space-y-2">
                {(isSaaS ? [
                  { key: 'new_signup', label: 'New Tenant Signup', desc: 'Alert when a new business registers on the platform.' },
                  { key: 'subscription_change', label: 'Subscription Update', desc: 'When a tenant upgrades or cancels their plan.' },
                  { key: 'system_load', label: 'Infrastructure Load', desc: 'High CPU or Memory usage on the central node.' },
                  { key: 'security_audit', label: 'Security Flags', desc: 'Repeated failed login attempts or 2FA bypass signals.' },
                  { key: 'database_sync', label: 'Database Health', desc: 'Status of multi-tenant database migrations and sync.' },
                ] : [
                  { key: 'new_order', label: 'New Order Placed', desc: 'When a customer submits an order via POS or portal.' },
                  { key: 'new_reservation', label: 'New Reservation', desc: 'When a fresh booking is logged by a guest.' },
                  { key: 'reservation_confirmed', label: 'Reservation Confirmed', desc: 'When a reservation status changes to confirmed.' },
                  { key: 'reservation_cancelled', label: 'Reservation Cancelled', desc: 'When a guest cancels their booking.' },
                  { key: 'expense_added', label: 'Expense Added', desc: 'When the AI scanner logs a new expense to the ledger.' },
                  { key: 'system_updates', label: 'System Updates', desc: 'Platform upgrade notes and engine announcements.' },
                ]).map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                    <div>
                      <div className="font-black text-sm text-slate-900 uppercase tracking-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => togglePref(item.key)}
                      className={`relative w-11 h-6 rounded-full transition-all ${notifPrefs[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all ${notifPrefs[item.key] ? 'left-6' : 'left-1'}`}></span>
                    </button>
                  </div>
                ))}
              </div>
              <SaveButton saving={saving} saved={saved} onClick={handleSaveNotifications} label="Save Preferences" />
            </div>
          )}
          {activeTab === 'language' && (
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Interface Language</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Choose the language for all dashboard menus, buttons, and labels. Changes take effect immediately across the entire system.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧', desc: 'Default system language' },
                  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸', desc: 'Español — Castellano' },
                  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷', desc: 'Français — France' },
                  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪', desc: 'Deutsch — Deutschland' },
                ].map(lang => {
                  const isSelected = i18n.language === lang.code || i18n.language?.startsWith(lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        localStorage.setItem('i18nextLng', lang.code);
                      }}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-4xl">{lang.flag}</span>
                      <div className="flex-1">
                        <div className={`font-black text-sm uppercase tracking-tight ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                          {lang.label}
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-0.5">{lang.native}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{lang.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
                <Globe className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-black text-slate-700 text-sm uppercase tracking-tight mb-1">Your current language</div>
                  <div className="text-sm text-slate-500 font-medium">
                    {{
                      en: '🇬🇧 English',
                      es: '🇪🇸 Español',
                      fr: '🇫🇷 Français',
                      de: '🇩🇪 Deutsch',
                    }[i18n.language?.slice(0, 2)] || '🇬🇧 English'} — selected above. Changes apply immediately to all menus, buttons, and labels without reloading.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SaveButton({ saving, saved, onClick, label = 'Update Record' }) {
  return (
    <button
      onClick={onClick}
      disabled={saving || saved}
      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-70 ${
        saved ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700'
      } text-white`}
    >
      {saved ? <><Check size={14} /> Saved to Hub</> : saving ? 'Syncing...' : <><Save size={14} /> {label}</>}
    </button>
  )
}
