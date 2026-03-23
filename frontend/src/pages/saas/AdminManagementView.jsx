import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, ShieldCheck, Mail, Key, Trash2, X, Check, Search, Activity, AlertTriangle } from 'lucide-react';
import api from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_tenants', label: 'Tenant Management', desc: 'Manage restaurant instances and features' },
  { id: 'manage_subscriptions', label: 'Subscriptions', desc: 'Control plans and billing logic' },
  { id: 'manage_admins', label: 'Admin Management', desc: 'Create and control other super admins' },
  { id: 'manage_settings', label: 'System Settings', desc: 'Global platform configuration' },
  { id: 'manage_cms', label: 'Content Management', desc: 'Manage landing page blogs and docs' },
  { id: 'manage_payments', label: 'Payment Gateways', desc: 'Configure Stripe, Paystack, Flutterwave' },
];

export default function AdminManagementView() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    permissions: []
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/saas/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch admins", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setFormData({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        password: '', // Don't show password
        permissions: admin.permissions || []
      });
    } else {
      setFormData({
        id: null,
        name: '',
        email: '',
        password: '',
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (formData.id) {
        await api.put(`/saas/admins/${formData.id}`, formData);
      } else {
        await api.post('/saas/admins', formData);
      }
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.email?.[0] || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/saas/admins/${id}`);
      fetchAdmins();
    } catch (err) {
      alert("Failed to delete admin");
    }
  };

  const confirmDelete = (id) => {
    setAdminToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Administrators</h1>
          <p className="text-slate-400 text-sm mt-1">Manage super admin accounts and granular feature access.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add New Admin
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            [1,2,3].map(i => <div key={i} className="h-48 bg-slate-800/30 rounded-3xl animate-pulse border border-slate-700/50" />)
        ) : filteredAdmins.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No administrators found matching your search.</p>
            </div>
        ) : filteredAdmins.map(admin => (
          <div key={admin.id} className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(admin)}
                  className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                >
                    <Activity className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => confirmDelete(admin.id)}
                  className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <Shield className={`w-6 h-6 ${admin.permissions?.length === AVAILABLE_PERMISSIONS.length ? 'text-emerald-400' : 'text-blue-400'}`} />
                </div>
                <div>
                    <h3 className="font-bold text-white">{admin.name}</h3>
                    <p className="text-xs text-slate-500">{admin.email}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-700 pb-2 mb-3">
                    <span>Feature Access</span>
                    <span>{admin.permissions?.length || 0} / {AVAILABLE_PERMISSIONS.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {admin.permissions?.length > 0 ? (
                        admin.permissions.map(p => (
                            <span key={p} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-tight border border-blue-500/20">
                                {p.replace('manage_', '').replace('_', ' ')}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] text-slate-600 font-medium italic">No active permissions</span>
                    )}
                </div>
            </div>

            {admin.permissions?.length === AVAILABLE_PERMISSIONS.length && (
                <div className="mt-6 pt-4 border-t border-slate-700 flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" /> Full Root Access
                </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">{formData.id ? 'Modify Access' : 'Create Admin Account'}</h3>
                <p className="text-sm text-slate-400 mt-1">Configure credentials and define feature boundaries.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      required
                      placeholder="e.g. Sarah Connor"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      required
                      type="email"
                      placeholder="admin@securegate.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Password {formData.id && '(Leave blank to keep current)'}</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      required={!formData.id}
                      type="password"
                      placeholder={formData.id ? "••••••••••••" : "Force strong passkey"}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Functional Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const active = formData.permissions.includes(perm.id);
                    return (
                        <button
                          key={perm.id}
                          type="button"
                          onClick={() => handleTogglePermission(perm.id)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                            active ? 'bg-blue-600/10 border-blue-600 shadow-md' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                           <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                             active ? 'bg-blue-600 border-blue-600' : 'border-slate-700'
                           }`}>
                             {active && <Check size={12} className="text-white" />}
                           </div>
                           <div>
                             <div className={`font-bold text-sm ${active ? 'text-white' : 'text-slate-300'}`}>{perm.label}</div>
                             <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{perm.desc}</div>
                           </div>
                        </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-4 rounded-2xl border border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Synchronizing...' : formData.id ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(adminToDelete)}
        title="Revoke Admin Access?"
        message="This admin will lose all access to the SaaS management panel immediately. This action can be reversed by creating a new account later if needed."
        confirmText="Revoke Access"
        type="danger"
      />
    </div>
  );
}
