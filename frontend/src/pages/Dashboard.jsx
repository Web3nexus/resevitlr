import React, { useState, useEffect } from 'react'
import { DollarSign, BarChart2, Calendar, LayoutGrid, MoreHorizontal, Filter, ChevronLeft, ChevronRight, Loader2, ArrowUpRight } from 'lucide-react'
import api from '../services/api'
import { useTranslation } from 'react-i18next'

export function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Stats Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
         <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-32 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
         <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">{t('stats.offline')}</p>
         <button onClick={fetchStats} className="mt-4 text-blue-600 font-bold uppercase text-[10px] tracking-widest hover:underline transition-all">{t('stats.retry')}</button>
      </div>
    );
  }

  const metrics = stats?.metrics || { total_revenue: 0, aov: 0, active_reservations: 0, net_profit: 0, total_expenses: 0 };
  const recent_orders = stats?.recent_orders || [];
  const top_items = stats?.top_items || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">{t('stats.bizIntel')}</h2>
         <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            {t('stats.liveSync')}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title={t('stats.totalRev')} 
          value={`$${metrics.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={20} className="text-slate-400" />} 
          trend={t('stats.liveData')} 
          trendColor="text-blue-500" 
          metric={<svg className="w-16 h-8 text-emerald-500" fill="none" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 25 Q 10 20 20 25 T 40 20 T 60 15 T 80 10 T 100 5 L 100 30 L 0 30 Z" className="fill-emerald-100"/><path d="M0 25 Q 10 20 20 25 T 40 20 T 60 15 T 80 10 T 100 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          topBorder
        />
        <KpiCard 
          title={t('stats.avgOrder')} 
          value={`$${metrics.aov.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<div className="bg-blue-50 p-1.5 rounded text-blue-500"><BarChart2 size={16} /></div>} 
          trend={t('stats.perGuest')} 
          trendColor="text-blue-500"
          metric={<ArrowUpRight size={24} className="text-slate-100" />}
          topBorder
        />
        <KpiCard 
          title={t('stats.reservations')} 
          value={metrics.active_reservations.toString()} 
          icon={<div className="bg-blue-50 p-1.5 rounded text-blue-500"><Calendar size={16} /></div>} 
          trend={t('stats.today')} 
          trendColor="text-blue-500"
          metric={<UsersGroupIcon />}
          topBorder
        />
        <KpiCard 
          title={t('stats.netProfit')} 
          value={`$${metrics.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle={t('stats.costs', { amount: metrics.total_expenses.toLocaleString() })}
          icon={<div className="bg-emerald-50 p-1.5 rounded text-emerald-600"><DollarSign size={16} /></div>} 
          metric={<TableIcon />}
          topBorder
        />
      </div>

      {/* Table Management View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
               <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{t('stats.floorMap')}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('stats.realTimeOcc')}</p>
            </div>
            <div className="flex gap-4">
               <LegendItem color="bg-emerald-500" label={t('stats.available')} />
               <LegendItem color="bg-blue-600" label={t('stats.occupied')} />
               <LegendItem color="bg-slate-300" label={t('stats.reserved')} />
            </div>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {(Array.isArray(stats.tables) ? stats.tables : []).map(table => (
               <div key={table.id} className={`p-4 rounded-2xl border-2 transition-all cursor-default flex flex-col items-center justify-center gap-3 active:scale-95 ${
                  table.status === 'available' ? 'bg-white border-slate-100 hover:border-emerald-200' :
                  table.status === 'occupied' ? 'bg-blue-50 border-blue-100' :
                  'bg-slate-50 border-slate-100'
               }`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-lg transition-transform ${
                     table.status === 'available' ? 'bg-emerald-500 text-white shadow-emerald-500/10' :
                     table.status === 'occupied' ? 'bg-blue-600 text-white shadow-blue-500/10 scale-110' :
                     'bg-slate-300 text-white shadow-slate-300/10'
                  }`}>
                     <LayoutGrid size={16} />
                  </div>
                  <div className="text-center">
                     <div className="font-black text-slate-900 text-xs tracking-tighter uppercase">{table.number}</div>
                     <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('stats.seats', { count: table.capacity })}</div>
                  </div>
               </div>
            ))}
            {!stats.tables?.length && (
               <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic border-2 border-dashed border-slate-100 rounded-3xl">
                  {t('stats.connectPos')}
               </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-5 flex justify-between items-center border-b border-slate-100 bg-slate-50/30">
             <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{t('stats.orderStream')}</h3>
             <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition tracking-widest">
               <Filter size={14} /> {t('stats.fullHistory')}
             </button>
           </div>
           <div className="overflow-x-auto min-h-[300px]">
             <table className="w-full text-sm text-left">
               <thead className="text-[10px] font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-200">
                 <tr>
                   <th className="px-5 py-4">{t('stats.ref')}</th>
                   <th className="px-5 py-4">{t('stats.customer')}</th>
                   <th className="px-5 py-4">{t('stats.items')}</th>
                   <th className="px-5 py-4 text-right">{t('stats.settlement')}</th>
                   <th className="px-5 py-4">{t('stats.status')}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {Array.isArray(recent_orders) && recent_orders.length > 0 ? recent_orders.map(order => (
                   <TableRow 
                     key={order.id}
                     id={`ORDER-${order.id}`} 
                     guest={order.customer_name || t('stats.guest')} 
                     items={t('stats.units', { count: (order.id % 4 + 2) })} 
                     total={`$${parseFloat(order.total_amount).toFixed(2)}`} 
                     status={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                     statusColor={order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'} 
                   />
                 )) : (
                    <tr>
                       <td colSpan="5" className="px-5 py-20 text-center text-slate-400 italic">{t('stats.noActivity')}</td>
                    </tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-black text-slate-800 mb-6 uppercase tracking-tight text-sm">{t('stats.highMargin')}</h3>
              <div className="space-y-6">
                {(Array.isArray(top_items) ? top_items : []) .map(item => (
                  <TopItem key={item.name} name={item.name} progress={item.progress} color={item.color} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calendar size={80} />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-2">{t('stats.internalEfficiency')}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t('stats.staffMetrics')}</p>
              
              <div className="flex justify-between items-end">
                 <div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">98.2%</div>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{t('stats.accuracyRate')}</div>
                 </div>
                 <div className="h-10 w-24 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 italic text-[10px] text-slate-400">
                    {t('stats.target')}
                 </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  )
}

function KpiCard({ title, value, subtitle, icon, trend, trendColor, metric, topBorder }) {
  return (
    <div className={`p-5 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-lg transition-all duration-300 ${topBorder ? 'border-t-[3px] border-t-blue-600' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        {icon}
      </div>
      <div className="flex items-end justify-between relative">
        <div className="z-10">
          <div className="text-2xl font-black text-slate-900 tracking-tighter">{value}</div>
          {subtitle && <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{subtitle}</div>}
          {trend && <div className={`text-[10px] font-black mt-2 uppercase tracking-widest ${trendColor}`}>{trend}</div>}
        </div>
        <div className="absolute right-0 bottom-0 opacity-40 pointer-events-none group-hover:scale-110 transition-transform">
          {metric}
        </div>
      </div>
    </div>
  )
}

function TableRow({ id, guest, items, total, status, statusColor }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-4 font-black text-blue-600 text-xs tracking-tight">{id}</td>
      <td className="px-5 py-4 font-bold text-slate-800">{guest}</td>
      <td className="px-5 py-4 text-slate-500 font-medium">{items}</td>
      <td className="px-5 py-4 font-black text-slate-900 text-right">{total}</td>
      <td className="px-5 py-4">
        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${statusColor}`}>
          {status}
        </span>
      </td>
    </tr>
  )
}

function TopItem({ name, progress, color }) {
  return (
    <div className="animate-in slide-in-from-left duration-500">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
        <span className="text-slate-500">{name}</span>
        <span className="text-slate-900">{progress}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: progress }}></div>
      </div>
    </div>
  )
}

function UsersGroupIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-100"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
}
function TableIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-100"><rect x="3" y="10" width="18" height="4" rx="1"></rect><path d="M5 14v6"></path><path d="M19 14v6"></path><path d="M8 10V6"></path><path d="M16 10V6"></path></svg>
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
       <div className={`h-2 w-2 rounded-full ${color}`}></div>
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}
