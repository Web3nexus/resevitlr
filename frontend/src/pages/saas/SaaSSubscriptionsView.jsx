import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Download, Search, CheckCircle, CircleX as XCircle, Loader2, Activity } from 'lucide-react';
import api from '../../services/centralApi';

export default function SaaSSubscriptionsView() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/saas/billing/metrics');
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch billing metrics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  const { metrics, recent_tenants } = data || { metrics: {}, recent_tenants: [] };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Billing & Subscriptions</h1>
          <p className="text-slate-400 text-sm mt-1">Manage tenant plans, monitor MRR, and view recent activity.</p>
        </div>
        
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-slate-700">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Monthly MRR
              </p>
              <p className="text-2xl font-bold text-white">${metrics.total_mrr?.toLocaleString() ?? '0'}</p>
              <p className="text-xs text-emerald-400 mt-1">Live Engine Data</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium mb-2">Active Paid</p>
              <p className="text-2xl font-bold text-white">{metrics.active_paid ?? '0'}</p>
              <p className="text-xs text-slate-500 mt-1">SaaS Revenue Stream</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium mb-2">Free Pier</p>
              <p className="text-2xl font-bold text-white">{metrics.free_tier ?? '0'}</p>
              <p className="text-xs text-slate-500 mt-1">Freemium Conversion</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium mb-2 flex items-center justify-between">
                  Churn Rate <span className="text-emerald-400 text-xs text-right">Healthy</span>
              </p>
              <p className="text-2xl font-bold text-white">{metrics.churn_rate ?? '0.0%'}</p>
              <p className="text-xs text-slate-500 mt-1">Retention Metrics</p>
          </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Activity className="w-5 h-5 text-blue-400" />
               <h3 className="text-white font-semibold">Recent Subscription Activity</h3>
             </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/50 text-slate-400">
              <th className="p-4 font-medium">Tenant Business</th>
              <th className="p-4 font-medium">Owner Email</th>
              <th className="p-4 font-medium">Plan</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Deployment Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
             {(Array.isArray(recent_tenants) && recent_tenants.length > 0) ? recent_tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-800/30">
                  <td className="p-4 font-medium text-blue-400">{tenant.business_name}</td>
                  <td className="p-4">{tenant.owner_email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                      tenant.plan === 'enterprise' ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20' :
                      tenant.plan === 'pro' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' :
                      'text-slate-400 bg-slate-500/10 border border-slate-500/20'
                    }`}>
                      {tenant.plan ?? 'free'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> 
                      <span className="capitalize">{tenant.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right text-slate-400">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
              </tr>
             )) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 italic">No recent subscription activity.</td>
              </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
