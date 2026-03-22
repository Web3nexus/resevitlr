import React, { useState, useEffect } from 'react'
import { Plus, Mail, Shield, MoreHorizontal, User, Loader2, Circle } from 'lucide-react'
import api from '../services/api'

export function StaffView() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'waiter', is_active: true });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data || []);
    } catch (err) {
      console.error('Staff Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', newStaff);
      setShowModal(false);
      setNewStaff({ name: '', email: '', role: 'waiter', is_active: true });
      fetchStaff();
    } catch (err) {
      console.error('Failed to add staff:', err);
      alert('Failed to register operator. Email might be in use.');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
         <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Human Resources</h2>
          <p className="text-slate-500 text-sm font-medium">Manage team profiles and access permissions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all w-max active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Add Operator
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Operator</th>
              <th className="px-8 py-5">Designation</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.length > 0 ? staff.map(member => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 tracking-tight uppercase text-sm">{member.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 font-bold uppercase tracking-tight">
                        <Mail size={12} className="text-blue-500" /> {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                     <Shield size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                     {member.role}
                   </div>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                     member.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                   }`}>
                     <Circle size={8} fill="currentColor" className={member.is_active ? 'animate-pulse' : ''} />
                     {member.is_active ? 'Active' : 'Offline'}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="p-2.5 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                     <MoreHorizontal size={20} />
                   </button>
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan="4" className="px-8 py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No registered operators found on system.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-lg mb-4 text-slate-900">Register New Operator</h3>
              <form onSubmit={handleAddStaff} className="space-y-4">
                 <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl mb-4">
                    <p className="text-[10px] text-blue-700 font-bold leading-tight">
                       Creating an operator will automatically generate a system user account. 
                       Temporary password: <span className="underline select-all font-black">password123</span>
                    </p>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                    <input required type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" placeholder="Jane Doe" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                    <input required type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" placeholder="jane@restaurant.com" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Authorization Role</label>
                    <select required value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none">
                       <option value="manager">Manager</option>
                       <option value="waiter">Waiter</option>
                       <option value="chef">Chef</option>
                       <option value="cashier">Cashier</option>
                    </select>
                 </div>
                 <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100 transition-colors">Cancel</button>
                    <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-slate-800 transition-colors">Add Staff</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
