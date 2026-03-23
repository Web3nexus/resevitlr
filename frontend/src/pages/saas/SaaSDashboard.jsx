import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, TrendingUp, Cpu, Activity, ArrowUpRight, CreditCard } from 'lucide-react';
import api from '../../services/centralApi';

export default function SaaSDashboard() {
  const [stats, setStats] = useState({
    active_tenants: 0,
    monthly_mrr: 0,
    system_load: '0%'
  });
  const [recentTenants, setRecentTenants] = useState([]);
  const [health, setHealth] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/saas/stats');
        if (statsRes.data?.stats) setStats(statsRes.data.stats);
        if (statsRes.data?.recent_tenants) setRecentTenants(statsRes.data.recent_tenants);

        const healthRes = await api.get('/saas/health');
        if (healthRes.data) setHealth(healthRes.data);

        const ticketsRes = await api.get('/saas/tickets');
        if (Array.isArray(ticketsRes.data)) setTickets(ticketsRes.data);
      } catch (error) {
        console.error("Failed to fetch SaaS dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors group">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Active Tenants</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-white">{isLoading ? '...' : (stats?.active_tenants ?? 0)}</h3>
                <span className={`text-xs font-semibold ${Number(stats?.tenant_growth) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isLoading ? '...' : (Number(stats?.tenant_growth) >= 0 ? `+${stats?.tenant_growth}%` : `${stats?.tenant_growth}%`)}
                </span>
            </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors group">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Monthly MRR</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-white">${isLoading ? '...' : (stats?.monthly_mrr ?? 0)}</h3>
                <span className={`text-xs font-semibold ${Number(stats?.mrr_growth) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isLoading ? '...' : (Number(stats?.mrr_growth) >= 0 ? `+${stats?.mrr_growth}%` : `${stats?.mrr_growth}%`)}
                </span>
            </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors group">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Cpu className="w-6 h-6 text-purple-400" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm font-medium">System Load</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-white">{isLoading ? '...' : (stats?.system_load ?? '0%')}</h3>
                <span className="text-slate-500 text-xs">Optimal</span>
            </div>
        </div>
      </div>
      
      {/* Chart and Recent activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-white">Revenue Growth</h3>
                    <p className="text-slate-500 text-sm">Historical trend based on active, verified subscriptions.</p>
                </div>
            </div>
            <div className="h-64 border-b border-l border-slate-700/30 flex items-end justify-between px-6 pb-2 gap-2">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs italic">
                        Fetching revenue data...
                    </div>
                ) : (
                    (Array.isArray(stats?.revenue_growth) ? stats.revenue_growth : [0,0,0,0,0,0,0]).map((data, i) => {
                        const h = Math.min(Math.max((data.value / (stats.monthly_mrr || 1000)) * 50, 10), 100);
                        return (
                            <div key={i} className="flex-1 max-w-[40px] bg-blue-600/20 hover:bg-blue-600/40 transition-colors rounded-t-lg relative group shadow-[0_-8px_20px_-10px_rgba(37,99,235,0.5)]" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                    ${Number(data.value).toLocaleString()}
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-medium uppercase">
                                    {data.day}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Deployments</h3>
            <div className="space-y-6">
                {isLoading ? (
                    <p className="text-slate-500 text-sm italic">Filing system status...</p>
                ) : (Array.isArray(recentTenants) && recentTenants.length === 0) ? (
                    <div className="text-center py-10 text-slate-500 italic text-sm">No recent signups detected.</div>
                  ) : (
                    (Array.isArray(recentTenants) ? recentTenants : []).map((tenant) => (
                    <div key={tenant.id} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors">
                            <Activity className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{tenant.business_name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-blue-400 text-[10px] font-bold uppercase truncate">{tenant.owner_name}</p>
                                <span className="text-slate-700 text-[10px]">•</span>
                                <p className="text-slate-500 text-[10px] truncate">{tenant.owner_email}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tenant?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                                {(tenant?.status ?? 'UNKNOWN').toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-600 font-mono">
                                {tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : '--'}
                            </span>
                        </div>
                    </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* System Health & Support Tickets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* System Health */}
         <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-semibold text-white">System Health</h3>
                  <p className="text-slate-500 text-sm">Active API and Infrastructure status.</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">{health?.status || 'Operational'}</span>
               </div>
            </div>

            <div className="space-y-4">
               {health?.services?.map(service => (
                  <div key={service.name} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            service.status === 'operational' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                           <Activity className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">{service.name}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-slate-500">{service.latency}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            service.status === 'operational' ? 'text-emerald-500' : 'text-red-500'
                        }`}>{service.status}</span>
                     </div>
                  </div>
               ))}
               {!health && [1,2,3].map(i => <div key={i} className="h-14 bg-slate-800/20 rounded-xl animate-pulse" />)}
            </div>
         </div>

         {/* Support Tickets */}
         <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-semibold text-white">Active Support Tickets</h3>
                  <p className="text-slate-500 text-sm">Tenant inquiries requiring attention.</p>
               </div>
               <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-2 py-1 rounded border border-slate-700 uppercase tracking-widest">{tickets?.length ?? 0} Pending</span>
            </div>

            <div className="flex-1 space-y-4">
               {!Array.isArray(tickets) || tickets.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                     <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-slate-600" />
                     </div>
                     <p className="text-slate-500 text-sm font-medium">Inbox Zero!</p>
                     <p className="text-slate-600 text-xs">All support requests have been resolved.</p>
                  </div>
               ) : (
                  tickets.map(ticket => (
                     <div key={ticket.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-blue-500/30 transition-colors group cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                               ticket.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                           }`}>{ticket.priority}</span>
                           <span className="text-[10px] text-slate-600">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '--'}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">{ticket.subject}</p>
                        <p className="text-xs text-slate-500 truncate mt-1">{ticket.message}</p>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
 
          {/* Infrastructure Shortcuts */}
          <div className="p-8 rounded-2xl bg-blue-600/5 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                   <CreditCard className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-white font-bold">Infrastructure Control</h3>
                   <p className="text-slate-400 text-xs">Configure global gateways: Stripe, Paystack, Flutterwave.</p>
                </div>
             </div>
             <Link 
               to="/securegate/settings" 
               onClick={() => {
                 // Option: suggest navigation to specific tab if possible, 
                 // but for now just pointing to settings is better than nothing.
                 localStorage.setItem('saas_settings_active_tab', 'payments');
               }}
               className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
             >
                Manage Gateways <ArrowUpRight className="w-4 h-4" />
             </Link>
          </div>
    </div>
  );
}
