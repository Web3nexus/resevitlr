import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Save, Globe, Shield, Mail, Database, Loader2, Bot, Layout, FileText, CreditCard, Package, Plus, Trash2, CheckCircle, CircleX as XCircle, MessageSquare, Copy, ExternalLink, Sparkles } from 'lucide-react';
import api from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const SYSTEM_FEATURES = [
  'basic_ordering', 
  'menu_management', 
  'ai_automation', 
  'social_integration',
  'financial_reports', 
  'multi_location', 
  'premium_support',
  'inventory_tracking', 
  'marketing_tools',
  'staff_management',
  'customer_logs'
];

export default function SaaSSettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    platform_name: '',
    central_domain: '',
    require_2fa: false,
    disable_public_signups: false,
    mail_mailer: 'resend',
    mail_host: '',
    mail_port: '',
    mail_username: '',
    mail_password: '',
    mail_encryption: 'tls',
    from_address: '',
    openai_api_key: '',
    claude_api_key: '',
    ai_provider: 'openai',
    global_ai_enabled: true,
    default_system_prompt: '',
    landing_hero_title: '',
    landing_hero_subtitle: '',
    terms_of_service: '',
    privacy_policy: '',
    social_verify_token: '',
    meta_system_token: '',
    test_recipient: '',
    stripe_enabled: false,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    paystack_enabled: false,
    paystack_public_key: '',
    paystack_secret_key: '',
    flutterwave_enabled: false,
    flutterwave_public_key: '',
    flutterwave_secret_key: '',
    flutterwave_encryption_key: '',
    default_currency: 'USD',
    platform_logo_url: '',
    platform_favicon_url: '',
    turnstile_site_key: '',
    turnstile_secret_key: '',
  });
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/saas/settings');
        setSettings(prev => ({ ...prev, ...(response.data || {}) }));
      } catch (error) {
        console.error("Failed to fetch SaaS settings", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPlans = async () => {
      try {
        const response = await api.get('/saas/plans');
        setPlans(response.data);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      }
    };

    fetchSettings();
    fetchPlans();
  }, []);

  const handleSavePlan = async (plan) => {
    try {
        await api.post('/saas/plans', plan);
        const response = await api.get('/saas/plans');
        setPlans(response.data);
        setEditingPlan(null);
        alert("Plan saved successfully!");
    } catch (error) {
        const msg = error.response?.data?.message || "Error saving plan.";
        const errors = error.response?.data?.errors;
        let detailedMsg = msg;
        if (errors) {
            detailedMsg += "\n" + Object.values(errors).flat().join("\n");
        }
        alert(detailedMsg);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
        await api.delete(`/saas/plans/${id}`);
        setPlans((Array.isArray(plans) ? plans : []).filter(p => p.id !== id));
    } catch (error) {
        alert("Error deleting plan.");
    }
  };

  const confirmDeletePlan = (id) => {
    setPlanToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/saas/settings', settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading system config...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure global application parameters and defaults.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'branding', label: 'Branding', icon: Sparkles },
            { id: 'security', label: 'Security & Auth', icon: Shield },
            { id: 'smtp', label: 'Email (SMTP)', icon: Mail },
            { id: 'ai', label: 'AI Engine', icon: Bot },
             { id: 'content', label: 'Landing Page', icon: Layout },
            { id: 'plans', label: 'Subscription Plans', icon: Package },
            { id: 'social', label: 'Social Webhooks', icon: MessageSquare },
            { id: 'legal', label: 'Legal & Privacy', icon: FileText },
            { id: 'external_links', label: 'Social & Community', icon: ExternalLink },
            { id: 'database', label: 'Database Routing', icon: Database },
            { id: 'payments', label: 'Payments', icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
            
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Platform Name</label>
                    <input 
                      type="text" 
                      value={settings.platform_name} 
                      onChange={e => setSettings({...settings, platform_name: e.target.value})}
                      className="w-full max-w-md bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Central Domain Name</label>
                    <input 
                      type="text" 
                      value={settings.central_domain} 
                      onChange={e => setSettings({...settings, central_domain: e.target.value})}
                      className="w-full max-w-md bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                    <p className="text-xs text-slate-500 mt-2">All tenant subdomains will append to this root domain.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Platform Branding</h3>
                  <p className="text-sm text-slate-400">Upload your platform logo and favicon to reflect across the entire OS.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-300">Platform Logo</label>
                    <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors hover:border-blue-500/50">
                      {settings.platform_logo_url ? (
                        <div className="relative group">
                          <img src={settings.platform_logo_url} alt="Platform Logo" className="h-16 w-auto object-contain bg-slate-800 p-2 rounded-lg" />
                          <button 
                            onClick={() => setSettings({ ...settings, platform_logo_url: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
                          <Layout className="w-8 h-8" />
                        </div>
                      )}
                      <div className="text-center">
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors block mb-2">
                          {settings.platform_logo_url ? 'Replace Logo' : 'Upload Logo'}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'logo');
                              try {
                                const res = await api.post('/saas/settings/upload-branding', formData);
                                setSettings({ ...settings, platform_logo_url: res.data.url });
                              } catch (err) {
                                alert("Failed to upload logo");
                              }
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">SVG, PNG or JPG (Max 2MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-300">Browser Favicon</label>
                    <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors hover:border-blue-500/50">
                      {settings.platform_favicon_url ? (
                        <div className="relative group">
                          <img src={settings.platform_favicon_url} alt="Favicon" className="w-12 h-12 object-contain bg-slate-800 p-2 rounded-lg" />
                          <button 
                            onClick={() => setSettings({ ...settings, platform_favicon_url: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
                          <Globe className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-center">
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors block mb-2">
                          {settings.platform_favicon_url ? 'Replace Favicon' : 'Upload Favicon'}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*,.ico"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'favicon');
                              try {
                                const res = await api.post('/saas/settings/upload-branding', formData);
                                setSettings({ ...settings, platform_favicon_url: res.data.url });
                              } catch (err) {
                                alert("Failed to upload favicon");
                              }
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">ICO, SVG or PNG (32x32 recommended)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Branding Tip</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Changes to the logo and platform name will reflect across the landing page, 
                      transactional emails, and all dashboard headers. Use a transparent PNG or SVG for the best visual experience.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-white mb-4">Security Policies</h3>
                 
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={settings.require_2fa} 
                              onChange={e => setSettings({...settings, require_2fa: e.target.checked})}
                              className="sr-only" 
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${settings.require_2fa ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.require_2fa ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white block">Require 2FA for Super Admins</span>
                            <span className="text-xs text-slate-400">Enforce multi-factor auth on /securegate</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group mt-4">
                        <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={settings.disable_public_signups} 
                              onChange={e => setSettings({...settings, disable_public_signups: e.target.checked})}
                              className="sr-only" 
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${settings.disable_public_signups ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.disable_public_signups ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white block">Disable Public Signups</span>
                            <span className="text-xs text-slate-400">Restricts tenant creation to API/Invite only.</span>
                        </div>
                    </label>
                 </div>

                 {/* Cloudflare Turnstile */}
                 <div className="mt-8 pt-6 border-t border-slate-800">
                   <div className="flex items-center gap-3 mb-1">
                     <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                       <Shield className="w-4 h-4 text-orange-400" />
                     </div>
                     <h4 className="text-sm font-bold text-white">Cloudflare Turnstile (CAPTCHA)</h4>
                   </div>
                   <p className="text-xs text-slate-500 mb-5 ml-10">Used on the public signup page to block bots. Get your keys from the <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Cloudflare Dashboard</a>.</p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                     <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Site Key (Public)</label>
                       <input
                         type="text"
                         value={settings.turnstile_site_key || ''}
                         onChange={e => setSettings({...settings, turnstile_site_key: e.target.value})}
                         placeholder="0x4AAA..."
                         className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none font-mono"
                       />
                       <p className="text-[10px] text-slate-600 mt-1">Used in the frontend signup widget.</p>
                     </div>
                     <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Secret Key (Server)</label>
                       <input
                         type="password"
                         value={settings.turnstile_secret_key || ''}
                         onChange={e => setSettings({...settings, turnstile_secret_key: e.target.value})}
                         placeholder="0x4AAA..."
                         className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none font-mono"
                       />
                       <p className="text-[10px] text-slate-600 mt-1">Used server-side to verify tokens.</p>
                     </div>
                   </div>
                 </div>
              </div>
            )}

            {activeTab === 'smtp' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-white mb-4">System Email Delivery</h3>
                 <p className="text-sm text-slate-400 mb-6">Configure the primary driver for SaaS welcome emails and password resets.</p>
                 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Mail Mailer</label>
                        <select 
                          value={settings.mail_mailer} 
                          onChange={e => setSettings({...settings, mail_mailer: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="resend">Resend</option>
                            <option value="mailgun">Mailgun</option>
                            <option value="smtp">SMTP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">From Address</label>
                        <input 
                          type="email" 
                          value={settings.from_address} 
                          onChange={e => setSettings({...settings, from_address: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>

                      {settings.mail_mailer === 'smtp' && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 mt-2">
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">SMTP Host</label>
                              <input 
                                type="text" 
                                value={settings.mail_host} 
                                onChange={e => setSettings({...settings, mail_host: e.target.value})}
                                placeholder="smtp.mailtrap.io"
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Port</label>
                              <input 
                                type="text" 
                                value={settings.mail_port} 
                                onChange={e => setSettings({...settings, mail_port: e.target.value})}
                                placeholder="2525"
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                              />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username</label>
                                <input 
                                  type="text" 
                                  value={settings.mail_username} 
                                  onChange={e => setSettings({...settings, mail_username: e.target.value})}
                                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                                <input 
                                  type="password" 
                                  value={settings.mail_password} 
                                  onChange={e => setSettings({...settings, mail_password: e.target.value})}
                                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Encryption</label>
                                <select 
                                  value={settings.mail_encryption} 
                                  onChange={e => setSettings({...settings, mail_encryption: e.target.value})}
                                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="null">None</option>
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                </select>
                            </div>
                        </div>
                      )}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-700/50 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="flex-1 max-w-sm">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Test Recipient Email</label>
                            <input 
                              type="email" 
                              value={settings.test_recipient} 
                              onChange={e => setSettings({...settings, test_recipient: e.target.value})}
                              placeholder="your-email@example.com"
                              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                        <button 
                            onClick={async () => {
                                if(!settings.test_recipient) return alert("Please enter a test recipient email.");
                                try {
                                    const res = await api.post('/saas/settings/test-email', { email: settings.test_recipient });
                                    alert(res.data.message);
                                } catch (err) {
                                    alert(err.response?.data?.message || "Failed to send test email.");
                                }
                            }}
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-6 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-blue-600/20 h-[42px]"
                        >
                            <Mail className="w-4 h-4" />
                            Send Test Email
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-500 italic">Save configuration before testing if you changed SMTP settings.</p>
                        <Link 
                            to="/securegate/email-templates" 
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                        >
                            Manage Email Templates
                        </Link>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700/50">
                      {/* Removed misplaced AI verify button from here */}
                  </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-white mb-4">Global AI Engine Settings</h3>
                 <p className="text-sm text-slate-400 mb-6">Configure the master OpenAI credentials and default behavior across all tenants.</p>
                 
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={settings.global_ai_enabled} 
                              onChange={e => setSettings({...settings, global_ai_enabled: e.target.checked})}
                              className="sr-only" 
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${settings.global_ai_enabled ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.global_ai_enabled ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white block">Enable AI Engine Globally</span>
                            <span className="text-xs text-slate-400">If disabled, no AI models will be invoked for any tenant.</span>
                        </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Primary AI Provider</label>
                            <select 
                                value={settings.ai_provider} 
                                onChange={e => setSettings({...settings, ai_provider: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="openai">OpenAI (GPT-4o)</option>
                                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Master OpenAI API Key</label>
                            <input 
                              type="password" 
                              value={settings.openai_api_key} 
                              onChange={e => setSettings({...settings, openai_api_key: e.target.value})}
                              placeholder="sk-..."
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600" 
                            />
                        </div>
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Anthropic Claude API Key</label>
                            <input 
                              type="password" 
                              value={settings.claude_api_key} 
                              onChange={e => setSettings({...settings, claude_api_key: e.target.value})}
                              placeholder="sk-ant-..."
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600" 
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Default System Prompt</label>
                        <textarea 
                          value={settings.default_system_prompt} 
                          onChange={e => setSettings({...settings, default_system_prompt: e.target.value})}
                          rows={6}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <p className="text-xs text-slate-500 mt-2">This is the base intent-analysis prompt that the restaurant owners will build upon.</p>
                    </div>

                    <div className="pt-6 border-t border-slate-700/50">
                        <button 
                          onClick={async () => {
                              try {
                                  const res = await api.post('/saas/settings/test-ai', { 
                                      openai_api_key: settings.openai_api_key,
                                      claude_api_key: settings.claude_api_key,
                                      ai_provider: settings.ai_provider
                                  });
                                  alert(res.data.message);
                              } catch (err) {
                                  alert(err.response?.data?.message || "AI Connection Failed.");
                              }
                          }}
                          className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 border border-blue-600/20"
                        >
                            <Bot className="w-3.5 h-3.5" />
                            Verify {settings.ai_provider === 'anthropic' ? 'Claude' : 'OpenAI'} Connection
                        </button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-white mb-4">Landing Page CMS</h3>
                 <p className="text-sm text-slate-400 mb-6">Manage the high-level marketing content for the public root page.</p>
                 
                 <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Hero Main Title</label>
                        <input 
                          type="text" 
                          value={settings.landing_hero_title} 
                          onChange={e => setSettings({...settings, landing_hero_title: e.target.value})}
                          placeholder="e.g. Next-Generation Restaurant OS"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Hero Sub-subtitle</label>
                        <textarea 
                          value={settings.landing_hero_subtitle} 
                          onChange={e => setSettings({...settings, landing_hero_subtitle: e.target.value})}
                          rows={3}
                          placeholder="Describe your platform's value proposition..."
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-medium text-white">Central Social Webhooks</h3>
                 </div>
                 <p className="text-sm text-slate-400 mb-6">Manage the master webhook configuration for Meta (WhatsApp/Facebook) and other social integrations.</p>
                 
                 <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Master Webhook URL</label>
                            <button 
                                onClick={() => {
                                    const url = `${window.location.origin}/api/social/webhook`;
                                    navigator.clipboard.writeText(url);
                                    alert("Copied to clipboard!");
                                }}
                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                                <Copy className="w-3 h-3" />
                                Copy URL
                            </button>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 font-mono text-sm text-white break-all">
                            {window.location.origin}/api/social/webhook
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 italic">Copy this URL to the "Webhook URL" field in your Meta Developer Portal.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Verify Token</label>
                        <div className="flex gap-3">
                            <input 
                                type="text"
                                value={settings.social_verify_token}
                                onChange={e => setSettings({...settings, social_verify_token: e.target.value})}
                                placeholder="resevit_secret_token"
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">Enter any string here and use the same value as "Verify Token" in Meta's configuration.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Meta System Access Token</label>
                        <input 
                            type="password"
                            value={settings.meta_system_token}
                            onChange={e => setSettings({...settings, meta_system_token: e.target.value})}
                            placeholder="EAAb..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-700"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">This token is used to send messages back to customers via WhatsApp and Facebook Graph APIs.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Setup Instructions</h4>
                        <ul className="space-y-2">
                            <li className="text-[10px] text-slate-400 flex items-start gap-2">
                                <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">1</span>
                                <span>Go to your <b>Meta App Dashboard</b> and select <b>WhatsApp</b> or <b>Webhooks</b>.</span>
                            </li>
                            <li className="text-[10px] text-slate-400 flex items-start gap-2">
                                <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">2</span>
                                <span>Paste the Webhook URL and Verify Token from above.</span>
                            </li>
                            <li className="text-[10px] text-slate-400 flex items-start gap-2">
                                <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">3</span>
                                <span>Subscribe to <b>messages</b> (for WhatsApp) or <b>messages/messaging_postbacks</b> (for Messenger).</span>
                            </li>
                        </ul>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-white mb-4">Legal Documents</h3>
                 <p className="text-sm text-slate-400 mb-6">Manage user agreements, terms of service and privacy policies.</p>
                 
                 <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Terms of Service (Markdown/HTML)</label>
                        <textarea 
                          value={settings.terms_of_service} 
                          onChange={e => setSettings({...settings, terms_of_service: e.target.value})}
                          rows={12}
                          className="w-full bg-slate-900 border border-slate-700 font-mono text-xs text-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Privacy Policy (Markdown/HTML)</label>
                        <textarea 
                          value={settings.privacy_policy} 
                          onChange={e => setSettings({...settings, privacy_policy: e.target.value})}
                          rows={12}
                          className="w-full bg-slate-900 border border-slate-700 font-mono text-xs text-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Subscription Tiers</h3>
                    <button 
                        onClick={() => setEditingPlan({ id: null, name: '', slug: '', monthly_price: 0, yearly_price: 0, features: [], is_active: true })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add New Plan
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(plans) && plans.map(plan => (
                        <div key={plan.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white font-bold">{plan.name}</h4>
                                    <p className="text-slate-500 text-xs font-mono">{plan.slug}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-white">${plan.monthly_price}<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                                    <p className="text-[10px] text-slate-500">${plan.yearly_price}/yr</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {(Array.isArray(plan.features) ? plan.features : []).map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                                        <CheckCircle className="w-3 h-3 text-emerald-500" /> {f.replace(/_/g, ' ')}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {plan.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setEditingPlan(plan)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => confirmDeletePlan(plan.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
            )}

            {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">{(editingPlan.id && editingPlan.id !== null) ? 'Edit' : 'Create'} Subscription Plan</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Plan Name</label>
                                <input 
                                    value={editingPlan.name}
                                    onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Slug (Internal)</label>
                                <input 
                                    value={editingPlan.slug}
                                    onChange={e => setEditingPlan({...editingPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Monthly Price ($)</label>
                                <input 
                                    type="number"
                                    value={editingPlan.monthly_price}
                                    onChange={e => setEditingPlan({...editingPlan, monthly_price: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Yearly Price ($)</label>
                                <input 
                                    type="number"
                                    value={editingPlan.yearly_price}
                                    onChange={e => setEditingPlan({...editingPlan, yearly_price: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-medium text-slate-500 mb-3 uppercase">Plan Features</label>
                            <div className="grid grid-cols-2 gap-2">
                                {SYSTEM_FEATURES.map(feat => (
                                    <label key={feat} className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox"
                                            checked={editingPlan.features?.includes(feat)}
                                            onChange={e => {
                                                const news = e.target.checked 
                                                    ? [...(editingPlan.features || []), feat]
                                                    : (editingPlan.features || []).filter(f => f !== feat);
                                                setEditingPlan({...editingPlan, features: news});
                                            }}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${editingPlan.features?.includes(feat) ? 'bg-blue-600 border-blue-600' : 'bg-slate-950 border-slate-800'}`}>
                                            {editingPlan.features?.includes(feat) && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{feat.replace(/_/g, ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={editingPlan.is_active}
                                    onChange={e => setEditingPlan({...editingPlan, is_active: e.target.checked})}
                                />
                                <span className="text-xs text-white">Active Tier</span>
                            </label>
                            <div className="flex gap-3">
                                <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white px-4 py-2 text-sm font-medium">Cancel</button>
                                <button onClick={() => handleSavePlan(editingPlan)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium">Save Plan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Database className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-medium text-white">Database Routing</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-6">Configure multi-tenant database routing and central domain settings.</p>
                </div>

                {/* Central Domain */}
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" /> Central Domain Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Central Domain</label>
                      <input
                        type="text"
                        value={settings.central_domain || ''}
                        onChange={e => setSettings({...settings, central_domain: e.target.value})}
                        placeholder="resevitweb.test"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none font-mono"
                      />
                      <p className="text-[10px] text-slate-600 mt-1">The root domain all tenants are provisioned under.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tenant Subdomain Pattern</label>
                      <input
                        type="text"
                        value={settings.tenant_subdomain_pattern || ''}
                        onChange={e => setSettings({...settings, tenant_subdomain_pattern: e.target.value})}
                        placeholder="{tenant}.resevitweb.test"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none font-mono"
                      />
                      <p className="text-[10px] text-slate-600 mt-1">Pattern used for generating tenant-specific URLs.</p>
                    </div>
                  </div>
                </div>

                {/* DB Connection */}
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-400" /> Central Database Connection
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">DB Host</label>
                      <input
                        type="text"
                        value={settings.db_host || ''}
                        onChange={e => setSettings({...settings, db_host: e.target.value})}
                        placeholder="127.0.0.1"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">DB Port</label>
                      <input
                        type="text"
                        value={settings.db_port || ''}
                        onChange={e => setSettings({...settings, db_port: e.target.value})}
                        placeholder="3306"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Database Name</label>
                      <input
                        type="text"
                        value={settings.db_database || ''}
                        onChange={e => setSettings({...settings, db_database: e.target.value})}
                        placeholder="resevitlr"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">DB Username</label>
                      <input
                        type="text"
                        value={settings.db_username || ''}
                        onChange={e => setSettings({...settings, db_username: e.target.value})}
                        placeholder="root"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">DB Password</label>
                      <input
                        type="password"
                        value={settings.db_password || ''}
                        onChange={e => setSettings({...settings, db_password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Tenancy Architecture Info Card */}
                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-2">Tenancy Architecture</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        This platform uses <span className="text-blue-400 font-semibold">single-database multi-tenancy</span>. Every tenant shares the same MySQL instance, with data isolated by <code className="text-xs bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded">tenant_id</code> on all tables. Routing happens via subdomain matching on every request.
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: 'Isolation Mode', value: 'Column (tenant_id)' },
                          { label: 'DB Driver', value: 'MySQL / MariaDB' },
                          { label: 'Routing', value: 'Subdomain → Tenant' },
                        ].map(item => (
                          <div key={item.label} className="bg-slate-900/70 rounded-xl p-3">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-xs text-white font-semibold">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <CreditCard className="w-6 h-6 text-blue-400" />
                   <h3 className="text-lg font-medium text-white">Payment Gateways</h3>
                </div>
                <p className="text-sm text-slate-400 mb-6">Configure global payment integrations for tenant subscriptions and billing.</p>
                
                <div className="space-y-6">
                  {/* Stripe */}
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 flex items-center justify-center border border-[#635BFF]/20">
                          <CreditCard className="w-5 h-5 text-[#635BFF]" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">Stripe</h4>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Global Default</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.stripe_enabled}
                          onChange={e => setSettings({...settings, stripe_enabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {settings.stripe_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Publishable Key</label>
                          <input 
                            type="text" 
                            value={settings.stripe_publishable_key}
                            onChange={e => setSettings({...settings, stripe_publishable_key: e.target.value})}
                            placeholder="pk_test_..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Secret Key</label>
                          <input 
                            type="password" 
                            value={settings.stripe_secret_key}
                            onChange={e => setSettings({...settings, stripe_secret_key: e.target.value})}
                            placeholder="sk_test_..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Webhook Secret</label>
                          <input 
                            type="password" 
                            value={settings.stripe_webhook_secret}
                            onChange={e => setSettings({...settings, stripe_webhook_secret: e.target.value})}
                            placeholder="whsec_..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Paystack */}
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#011B33]/10 flex items-center justify-center border border-[#011B33]/20">
                           <div className="w-5 h-5 bg-[#00C3DA] rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">Paystack</h4>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Africa / Nigeria / Ghana</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.paystack_enabled}
                          onChange={e => setSettings({...settings, paystack_enabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {settings.paystack_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Public Key</label>
                          <input 
                            type="text" 
                            value={settings.paystack_public_key}
                            onChange={e => setSettings({...settings, paystack_public_key: e.target.value})}
                            placeholder="pk_test_..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Secret Key</label>
                          <input 
                            type="password" 
                            value={settings.paystack_secret_key}
                            onChange={e => setSettings({...settings, paystack_secret_key: e.target.value})}
                            placeholder="sk_test_..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flutterwave */}
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center border border-[#F5A623]/20">
                           <CreditCard className="w-5 h-5 text-[#F5A623]" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">Flutterwave</h4>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Multicurrency / Africa</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.flutterwave_enabled}
                          onChange={e => setSettings({...settings, flutterwave_enabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {settings.flutterwave_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Public Key</label>
                          <input 
                            type="text" 
                            value={settings.flutterwave_public_key}
                            onChange={e => setSettings({...settings, flutterwave_public_key: e.target.value})}
                            placeholder="FLWPUBK_TEST-..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Secret Key</label>
                          <input 
                            type="password" 
                            value={settings.flutterwave_secret_key}
                            onChange={e => setSettings({...settings, flutterwave_secret_key: e.target.value})}
                            placeholder="FLWSECK_TEST-..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Encryption Key</label>
                          <input 
                            type="password" 
                            value={settings.flutterwave_encryption_key}
                            onChange={e => setSettings({...settings, flutterwave_encryption_key: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'external_links' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-white mb-4">Social & Community Links</h3>
                 <p className="text-sm text-slate-400 mb-6">Manage the links that appear on your public website and community pages.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp Channel URL</label>
                        <input 
                          type="text" 
                          value={settings.whatsapp_channel_url || ''} 
                          onChange={e => setSettings({...settings, whatsapp_channel_url: e.target.value})}
                          placeholder="https://whatsapp.com/channel/..."
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Community URL (Owners Group)</label>
                        <input 
                          type="text" 
                          value={settings.community_url || ''} 
                          onChange={e => setSettings({...settings, community_url: e.target.value})}
                          placeholder="https://community.resevit.com"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Instagram Profile</label>
                        <input 
                          type="text" 
                          value={settings.instagram_url || ''} 
                          onChange={e => setSettings({...settings, instagram_url: e.target.value})}
                          placeholder="https://instagram.com/resevit"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Twitter / X Profile</label>
                        <input 
                          type="text" 
                          value={settings.twitter_url || ''} 
                          onChange={e => setSettings({...settings, twitter_url: e.target.value})}
                          placeholder="https://twitter.com/resevit"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Facebook Page</label>
                        <input 
                          type="text" 
                          value={settings.facebook_url || ''} 
                          onChange={e => setSettings({...settings, facebook_url: e.target.value})}
                          placeholder="https://facebook.com/resevit"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                 </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDeletePlan(planToDelete)}
        title="Delete Subscription Plan?"
        message="Are you sure you want to delete this plan? This could potentially disrupt billing for existing tenants on this tier."
        confirmText="Delete Plan"
        type="danger"
      />
    </div>
  );
}
