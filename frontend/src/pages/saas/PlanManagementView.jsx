import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, X, Loader2, MessageSquare, DollarSign, Bot, Calendar, Component, Utensils, Table, Save, Infinity, LayoutDashboard, Users, CreditCard, Settings, ShoppingBag, Package } from 'lucide-react';
import api from '../../services/centralApi';

// IMPORTANT: The 'key' values below MUST match exactly what DashboardLayout.jsx
// passes to hasFeature(). Sidebar items without a feature check are always visible
// and are listed below for clarity but can't be toggled per-plan.
const ALL_FEATURES = [
  // Always-visible sidebar items (always included — no hasFeature check in sidebar)
  { key: 'insights',         label: 'Insights',            description: 'Dashboard overview & analytics', icon: LayoutDashboard, alwaysOn: true },
  { key: 'reservations',     label: 'Reservations',        description: 'Accept and manage table bookings', icon: Calendar, alwaysOn: true },
  { key: 'configuration',    label: 'Configuration',        description: 'Store & platform settings', icon: Settings, alwaysOn: true },
  { key: 'provisioning',     label: 'Provisioning',         description: 'New setup & onboarding tools', icon: Plus, alwaysOn: true },
  { key: 'billing_plan',     label: 'Billing & Plan',       description: 'View & upgrade subscription', icon: CreditCard, alwaysOn: true },
  
  // Gated features — controlled by hasFeature() in DashboardLayout.jsx
  // Exactly 9 gated features as requested
  { key: 'social_integration', label: 'Unified Chat',        description: 'WhatsApp, Facebook, Instagram', icon: MessageSquare, alwaysOn: false },
  { key: 'pos_terminal',       label: 'POS Terminal',         description: 'In-house ordering & payments', icon: Component, alwaysOn: false },
  { key: 'menu_builder',       label: 'Menu Builder',         description: 'Digital catalog & QR ordering', icon: Utensils, alwaysOn: false },
  { key: 'floor_plan',         label: 'Floor Plan',           description: 'Visual table management', icon: Table, alwaysOn: false },
  { key: 'staff_management',   label: 'Staff Profiles',       description: 'Account access & role control', icon: Users, alwaysOn: false },
  { key: 'financial_reports',  label: 'Financials',          description: 'Revenue, expenses & profit metrics', icon: DollarSign, alwaysOn: false },
  { key: 'ai_automation',      label: 'AI Command',          description: 'AI workflow & intelligent responses', icon: Bot, alwaysOn: false },
  { key: 'online_ordering',    label: 'Online Ordering',      description: 'Customer ordering web portal', icon: ShoppingBag, alwaysOn: false },
  { key: 'inventory_tracking', label: 'Inventory Management', description: 'Stock levels & ingredient tracking', icon: Package, alwaysOn: false },
];

const defaultFeatures = Object.fromEntries(ALL_FEATURES.map(f => [f.key, false]));

const defaultPlan = {
  name: '',
  slug: '',
  monthly_price: '',
  yearly_price: '',
  reservation_limit: '',
  max_staff: '',
  ai_credits_limit: '',
  features: { ...defaultFeatures },
  is_active: true,
};

export default function PlanManagementView() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/saas/plans');
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch plans', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openNew = () => setEditingPlan({ ...defaultPlan, features: { ...defaultFeatures } });
  const openEdit = (plan) => setEditingPlan({
    ...plan,
    features: { ...defaultFeatures, ...(plan.features || {}) },
    reservation_limit: plan.reservation_limit ?? '',
    max_staff: plan.max_staff ?? '',
    ai_credits_limit: plan.ai_credits_limit ?? '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...editingPlan,
        reservation_limit: editingPlan.reservation_limit === '' ? null : parseInt(editingPlan.reservation_limit, 10),
        max_staff: editingPlan.max_staff === '' ? null : parseInt(editingPlan.max_staff, 10),
        ai_credits_limit: editingPlan.ai_credits_limit === '' ? null : parseInt(editingPlan.ai_credits_limit, 10),
      };
      await api.post('/saas/plans', payload);
      setMessage({ type: 'success', text: 'Plan saved successfully!' });
      setEditingPlan(null);
      fetchPlans();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save plan.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan? Tenants on it will remain but new signups cannot select it.')) return;
    try {
      await api.delete(`/saas/plans/${id}`);
      fetchPlans();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete plan.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleFeature = (key) => {
    setEditingPlan(p => ({ ...p, features: { ...p.features, [key]: !p.features[key] } }));
  };

  const planColor = (slug) =>
    slug === 'enterprise' ? 'text-purple-400 border-purple-500/20 bg-purple-500/10' :
    slug === 'pro' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' :
    'text-slate-400 border-slate-500/20 bg-slate-500/10';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Plan Management</h1>
          <p className="text-slate-400 text-sm mt-1">Configure subscription tiers, features, and limits.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Toast */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Plan Cards */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(plans.length === 0 ? [] : plans).map(plan => (
            <div key={plan.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4 hover:border-slate-600/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${planColor(plan.slug)}`}>{plan.name}</span>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-white">${plan.monthly_price}</span>
                    <span className="text-slate-500 text-sm">/mo</span>
                  </div>
                  {plan.yearly_price > 0 && (
                    <div className="text-xs text-slate-500 mt-0.5">${plan.yearly_price}/yr</div>
                  )}
                </div>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => openEdit(plan)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">
                    {plan.reservation_limit ?? <Infinity className="w-5 h-5 mx-auto text-emerald-400" />}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Reservations/mo</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">
                    {plan.max_staff ?? <Infinity className="w-5 h-5 mx-auto text-emerald-400" />}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Staff Accounts</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 text-center col-span-2">
                  <div className="text-lg font-black text-blue-400">
                    {plan.ai_credits_limit ?? <Infinity className="w-5 h-5 mx-auto text-emerald-400" />}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Monthly AI Credits</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5">
                {ALL_FEATURES.map(f => {
                  const enabled = f.alwaysOn || !!plan.features?.[f.key];
                  return (
                    <div key={f.key} className={`flex items-center gap-2 text-xs font-medium ${enabled ? 'text-slate-300' : 'text-slate-600'}`}>
                      <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${enabled ? 'text-emerald-400' : 'text-slate-700'}`} />
                      {f.label}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="md:col-span-3 py-20 text-center text-slate-500 italic border-2 border-dashed border-slate-800 rounded-3xl">
              No plans yet. Click "New Plan" to get started.
            </div>
          )}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingPlan(null)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <form onSubmit={handleSave}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">{editingPlan.id ? 'Edit Plan' : 'Create New Plan'}</h3>
                <button type="button" onClick={() => setEditingPlan(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Plan Name</label>
                    <input required value={editingPlan.name} onChange={e => setEditingPlan(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Pro" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Slug (Internal ID)</label>
                    <input required value={editingPlan.slug} onChange={e => setEditingPlan(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      placeholder="e.g. pro" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Monthly Price ($)</label>
                    <input required type="number" min="0" step="0.01" value={editingPlan.monthly_price} onChange={e => setEditingPlan(p => ({ ...p, monthly_price: e.target.value }))}
                      placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Yearly Price ($)</label>
                    <input type="number" min="0" step="0.01" value={editingPlan.yearly_price} onChange={e => setEditingPlan(p => ({ ...p, yearly_price: e.target.value }))}
                      placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Usage Limits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Monthly Reservation Limit</label>
                      <input type="number" min="0" value={editingPlan.reservation_limit} onChange={e => setEditingPlan(p => ({ ...p, reservation_limit: e.target.value }))}
                        placeholder="Leave blank for unlimited" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 text-sm" />
                      <p className="text-[10px] text-slate-600 mt-1">Leave blank = ∞ unlimited</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Max Staff Accounts</label>
                      <input type="number" min="0" value={editingPlan.max_staff} onChange={e => setEditingPlan(p => ({ ...p, max_staff: e.target.value }))}
                        placeholder="Leave blank for unlimited" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 text-sm" />
                      <p className="text-[10px] text-slate-600 mt-1">Leave blank = ∞ unlimited</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Monthly AI Credits</label>
                      <input type="number" min="0" value={editingPlan.ai_credits_limit} onChange={e => setEditingPlan(p => ({ ...p, ai_credits_limit: e.target.value }))}
                        placeholder="e.g. 1000 (Leave blank for unlimited)" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 text-sm" />
                      <p className="text-[10px] text-slate-600 mt-1">Set to 0 to disable AI. Leave blank for unlimited.</p>
                    </div>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Always Included</h4>
                  <p className="text-[10px] text-slate-600 mb-3">These features are available on every plan and cannot be removed.</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {ALL_FEATURES.filter(f => f.alwaysOn).map(f => {
                      const Icon = f.icon;
                      return (
                        <div key={f.key} className="flex items-center gap-2 p-2.5 bg-slate-950/30 border border-slate-800/50 rounded-xl opacity-60">
                          <div className="p-1.5 bg-slate-800 rounded-lg text-slate-500"><Icon className="w-3.5 h-3.5" /></div>
                          <span className="text-xs font-medium text-slate-500">{f.label}</span>
                          <CheckCircle className="w-3 h-3 text-emerald-600 ml-auto shrink-0" />
                        </div>
                      );
                    })}
                  </div>

                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Gated Features</h4>
                  <p className="text-[10px] text-slate-600 mb-3">Toggle which premium features this plan grants access to.</p>
                  <div className="space-y-2">
                    {ALL_FEATURES.filter(f => !f.alwaysOn).map(f => {
                      const Icon = f.icon;
                      const enabled = !!editingPlan.features[f.key];
                      return (
                        <div key={f.key}
                          onClick={() => toggleFeature(f.key)}
                          className={`flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                            enabled ? 'bg-blue-600/10 border-blue-600/30' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${enabled ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${enabled ? 'text-white' : 'text-slate-500'}`}>{f.label}</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">{f.description}</p>
                          </div>
                          <div className={`w-10 h-5 rounded-full transition-all shrink-0 relative ${enabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
                            <div className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={editingPlan.is_active} onChange={e => setEditingPlan(p => ({ ...p, is_active: e.target.checked }))} />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                  <span className="text-sm font-medium text-slate-300">Plan is Active (visible to new subscribers)</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 flex gap-3">
                <button type="button" onClick={() => setEditingPlan(null)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-medium hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
