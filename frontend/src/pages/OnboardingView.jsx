import React, { useState } from 'react'
import { Plus, Globe, Building2, Rocket, Loader2, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import api from '../services/api'

export default function OnboardingView() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    business_name: '',
    domain: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('tenants', formData);
      setSuccess(true);
    } catch (err) {
      console.error('Onboarding Error:', err);
      alert('Provisioning failed. Check if subdomain is taken.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in duration-500">
         <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <CheckCircle size={48} strokeWidth={1.5} />
         </div>
         <div className="max-w-md space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Launch Sequence Complete</h2>
            <p className="text-slate-500 font-medium">Your dedicated instance is being provisioned. Access it shortly at <span className="text-blue-600 font-bold">{formData.domain}.resevit.test</span></p>
         </div>
         <button 
           onClick={() => setSuccess(false)}
           className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
         >
           Initialize Another Node
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
         <div className="h-16 w-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 mb-6">
            <Plus size={32} strokeWidth={2.5} />
         </div>
         <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Provision New Tenant</h2>
         <p className="text-slate-500 font-medium">Deploy a scalable, isolated restaurant engine in seconds.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-8">
         <div className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Building2 size={12} /> Legal Business Name
               </label>
               <input 
                 required
                 type="text" 
                 placeholder="e.g. Gotham Steakhouse"
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-800 focus:border-blue-600 focus:bg-white transition-all outline-none text-lg shadow-inner"
                 value={formData.business_name}
                 onChange={(e) => setFormData({...formData, business_name: e.target.value})}
               />
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Globe size={12} /> Target Subdomain
               </label>
               <div className="flex items-center gap-2">
                  <input 
                    required
                    type="text" 
                    placeholder="gotham"
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-800 focus:border-blue-600 focus:bg-white transition-all outline-none text-lg shadow-inner"
                    value={formData.domain}
                    onChange={(e) => {
                       const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                       setFormData({...formData, domain: val, id: val});
                    }}
                  />
                  <div className="px-6 py-4 bg-slate-100 rounded-3xl font-black text-slate-400 uppercase tracking-widest text-sm">
                    .resevit.test
                  </div>
               </div>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1 italic">Subdomain will serve as unique Tenant-ID</p>
            </div>
         </div>

         <div className="pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {loading ? (
                 <>
                   <Loader2 className="animate-spin" size={24} />
                   Orchestrating Environment...
                 </>
              ) : (
                 <>
                    Deploy Engine <ArrowRight size={20} />
                 </>
              )}
            </button>
         </div>

         <div className="flex items-center justify-center gap-6 pt-4 grayscale opacity-40">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
               <ShieldCheck size={14} /> ISO-27001
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
               <Rocket size={14} /> AUTO-SCALING
            </div>
         </div>
      </form>
    </div>
  )
}
