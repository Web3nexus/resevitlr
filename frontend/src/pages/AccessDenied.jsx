import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="h-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-red-100 ring-8 ring-white">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Access Denied</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        You don't have the required permissions to view this section. This area is restricted to Business Owners and Administrators.
      </p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
      >
        <ArrowLeft size={18} />
        Return to Dashboard
      </button>
    </div>
  );
}
