import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MoreVertical, ShieldAlert, CheckCircle, Activity, Play, Pause, Edit, Trash2, X, ExternalLink } from 'lucide-react';
import api from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function TenantManagementView() {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    id: '',
    business_name: '',
    domain: '',
    plan: 'free',
    owner_email: '',
    owner_name: ''
  });
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isUpdatingFeatures, setIsUpdatingFeatures] = useState(false);
  const [tenantStaff, setTenantStaff] = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/saas/tenants');
      setTenants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch tenants", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/saas/plans');
      setPlans(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchTenantStaff(selectedTenant.id);
    }
  }, [selectedTenant]);

  const fetchTenantStaff = async (id) => {
    setIsStaffLoading(true);
    try {
      const response = await api.get(`/saas/tenants/${id}/staff`);
      setTenantStaff(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch tenant staff", error);
    } finally {
      setIsStaffLoading(false);
    }
  };

  const handleUpdateFeatures = async (features) => {
    setIsUpdatingFeatures(true);
    try {
      await api.patch(`/saas/tenants/${selectedTenant.id}/features`, { features });
      
      // Update local state
      const updatedTenants = tenants.map(t => 
        t.id === selectedTenant.id ? { ...t, features } : t
      );
      setTenants(updatedTenants);
      setSelectedTenant({ ...selectedTenant, features });
    } catch (error) {
      alert("Failed to update features");
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/saas/tenants', newTenant);
      setIsModalOpen(false);
      const defaultPlan = plans[0]?.slug || 'free';
      setNewTenant({ id: '', business_name: '', domain: '', plan: defaultPlan, owner_email: '', owner_name: '' });
      fetchTenants();
    } catch (error) {
      alert("Failed to create tenant. Check if ID or Domain is taken.");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/saas/tenants/${id}/status`, { status: newStatus });
      fetchTenants();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const deleteTenant = async (id) => {
    try {
      await api.delete(`/saas/tenants/${id}`);
      fetchTenants();
      if (selectedTenant?.id === id) setSelectedTenant(null);
    } catch (error) {
      console.error("Failed to delete tenant", error);
    }
  };

  const confirmDelete = (id) => {
    setTenantToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleImpersonate = async (tenant) => {
    try {
      const response = await api.get(`/saas/tenants/${tenant.id}/impersonate`);
      const { redirect_url } = response.data;
      
      if (redirect_url) {
        window.open(redirect_url, '_blank');
      }
    } catch (error) {
      console.error("Impersonation failed", error);
      alert("Failed to start impersonation session. Make sure the tenant database is set up correctly.");
    }
  };

  const handleEditTenant = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/saas/tenants/${editingTenant.id}`, {
        business_name: editingTenant.business_name,
        plan: editingTenant.plan,
        status: editingTenant.status,
      });
      setEditingTenant(null);
      fetchTenants();
    } catch (error) {
      console.error("Failed to update tenant", error);
      alert("Failed to update tenant.");
    }
  };

  const filteredTenants = Array.isArray(tenants) ? tenants.filter(t => 
    t?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t?.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tenants</h1>
          <p className="text-slate-400 text-sm mt-1">Manage restaurant instances, billing, and status.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Tenant
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by business name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Plans</option>
                {plans?.map(p => (
                  <option key={p.id} value={p.slug}>{p.name} (${p.monthly_price})</option>
                ))}
            </select>
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
            </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Business / Domain</th>
              <th className="p-4 font-medium">Owner</th>
              <th className="p-4 font-medium">Plan</th>
              <th className="p-4 font-medium text-center">Staff</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Created</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading tenants...
                </td>
              </tr>
            ) : filteredTenants.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  No tenants found.
                </td>
              </tr>
             ) : (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setSelectedTenant(tenant)}>
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="cursor-pointer" onClick={() => setSelectedTenant(tenant)}>
                        <p className="text-white font-medium hover:text-blue-400 transition-colors">{tenant.business_name}</p>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">{tenant.id}</span>
                            <span>•</span>
                            <span className="hover:text-blue-400 transition-colors">
                                {tenant.domain}
                            </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-medium">{tenant.owner_name}</p>
                    <p className="text-slate-500 text-xs">{tenant.owner_email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold capitalize border ${
                        tenant.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        tenant.plan === 'pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                        {tenant.plan}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                        onClick={() => setSelectedTenant(tenant)}
                        className="font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
                    >
                        {tenant.staff_count || 0}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                        {tenant.status === 'active' ? (
                            <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-500">Active</span></>
                        ) : (
                            <><ShieldAlert className="w-4 h-4 text-red-400" /> <span className="text-red-400">Suspended</span></>
                        )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">
                    {tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingTenant({...tenant})}
                          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors" title="Edit Tenant"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        {tenant.id !== 'landlord' && (
                            <button 
                              onClick={() => handleImpersonate(tenant)}
                              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition-colors" title="Login as Business"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        )}
                        {tenant.status === 'active' ? (
                            <button 
                              onClick={() => toggleStatus(tenant.id, 'active')}
                              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition-colors" title="Suspend Tenant"
                            >
                                <Pause className="w-4 h-4" />
                            </button>
                        ) : (
                            <button 
                              onClick={() => toggleStatus(tenant.id, 'suspended')}
                              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors" title="Reactivate Tenant"
                            >
                                <Play className="w-4 h-4" />
                            </button>
                        )}
                        <button 
                          onClick={() => confirmDelete(tenant.id)}
                          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors" title="Delete Tenant Data"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Create New Restaurant</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Internal ID (slug)</label>
                    <input 
                      required
                      placeholder="e.g. mcdonalds-dt"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTenant.id}
                      onChange={e => setNewTenant({...newTenant, id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Business Name</label>
                    <input 
                      required
                      placeholder="McDonald's Downtown"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTenant.business_name}
                      onChange={e => setNewTenant({...newTenant, business_name: e.target.value})}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Plan</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                      value={newTenant.plan}
                      onChange={e => setNewTenant({...newTenant, plan: e.target.value})}
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.slug}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Domain Name</label>
                    <input 
                      required
                      placeholder="mcdonalds.resevitlr.test"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTenant.domain}
                      onChange={e => setNewTenant({...newTenant, domain: e.target.value})}
                    />
                  </div>
                   <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Owner Full Name</label>
                    <input 
                      required
                      placeholder="John Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTenant.owner_name}
                      onChange={e => setNewTenant({...newTenant, owner_name: e.target.value})}
                    />
                  </div>
                   <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Owner Email Address</label>
                    <input 
                      required
                      type="email"
                      placeholder="manager@mcdonalds.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTenant.owner_email}
                      onChange={e => setNewTenant({...newTenant, owner_email: e.target.value})}
                    />
                  </div>
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all"
                  >
                    Deploy Restaurant
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingTenant(null)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Tenant</h3>
              <button onClick={() => setEditingTenant(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleEditTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Business Name</label>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingTenant.business_name}
                  onChange={e => setEditingTenant({...editingTenant, business_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Plan</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingTenant.plan}
                  onChange={e => setEditingTenant({...editingTenant, plan: e.target.value})}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingTenant.status}
                  onChange={e => setEditingTenant({...editingTenant, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deep View Slide-over */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSelectedTenant(null)} />
           <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                       <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{selectedTenant.business_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-blue-400 text-xs font-bold uppercase">{selectedTenant.owner_name}</p>
                            <span className="text-slate-600 text-xs">•</span>
                            <p className="text-slate-500 text-xs">{selectedTenant.owner_email}</p>
                        </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                 </button>
              </div>

              {/* Feature Toggles */}
              <div className="mb-10">
                 <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Module Access Control</h4>
                 <div className="grid grid-cols-1 gap-3">
                    {['AI Command Center', 'Online Ordering', 'Financial Reports', 'Staff Management'].map(feature => {
                        const featureKey = feature.toLowerCase().replace(/\s+/g, '_');
                        const isEnabled = selectedTenant?.features?.[featureKey] !== false;
                        return (
                           <div key={feature} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex align-center justify-between group">
                              <div>
                                 <p className="text-sm font-bold text-white mb-0.5">{feature}</p>
                                 <p className="text-[10px] text-slate-500 font-medium">Allow {selectedTenant.business_name} access to this module.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer scale-90">
                                 <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={isEnabled}
                                    disabled={isUpdatingFeatures}
                                    onChange={(e) => {
                                        const newFeatures = { ...selectedTenant.features, [featureKey]: e.target.checked };
                                        handleUpdateFeatures(newFeatures);
                                    }}
                                 />
                                 <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                           </div>
                        );
                    })}
                 </div>
              </div>

              {/* Staff Audit */}
              <div className="flex-1">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Personnel ({tenantStaff.length})</h4>
                    <Activity className={`w-4 h-4 text-emerald-500 ${isStaffLoading ? 'animate-pulse' : ''}`} />
                 </div>
                 
                 <div className="space-y-3">
                    {isStaffLoading ? (
                        [1,2,3].map(i => <div key={i} className="h-16 bg-slate-800/20 rounded-2xl animate-pulse border border-slate-800" />)
                    ) : tenantStaff.length === 0 ? (
                        <p className="p-8 text-center text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-3xl">No staff records found in tenant database.</p>
                    ) : (
                        tenantStaff.map(staff => (
                           <div key={staff.id} className="p-4 rounded-2xl bg-slate-800/10 border border-slate-800 flex items-center gap-4 group hover:bg-slate-800/30 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 uppercase font-black text-xs border border-blue-600/20">
                                 {staff?.name?.substring(0,2) || '??'}
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-300">{staff?.name || 'Unknown'}</p>
                                    {staff?.is_owner ? ( <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm shadow-blue-500/30 uppercase tracking-widest flex items-center"> Owner </span> ) : ( <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase border border-slate-700 tracking-wider"> {staff?.role || 'staff'} </span> )}
                                 </div>
                                 <p className="text-[10px] text-slate-500 font-medium">{staff?.email || 'N/A'}</p>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${staff?.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                           </div>
                        ))
                    )}
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800">
                  <button onClick={() => confirmDelete(selectedTenant.id)} className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                    Purge Instance Data
                  </button>
              </div>
           </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteTenant(tenantToDelete)}
        title="Purge Restaurant Data?"
        message="This will permanently delete the entire restaurant database, including all orders, staff and customers. This action is irreversible."
        confirmText="Purge Database"
        type="danger"
      />
    </div>
  );
}
