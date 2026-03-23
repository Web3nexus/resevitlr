import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Coffee, UtilityPole, Home, Briefcase, Scan, Loader2 } from 'lucide-react'
import { AIScanner } from './AIScanner'
import api from '../services/api'

export function FinancialsView() {
  const [showScanner, setShowScanner] = useState(false);
  const [data, setData] = useState({ revenue: 0, expenses: 0, list: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const [ordersRes, expensesRes] = await Promise.all([
        api.get('/orders'),
        api.get('/expenses')
      ]);

      const orders = ordersRes.data || [];
      const expenses = expensesRes.data || [];

      const totalRevenue = orders.reduce((acc, order) => acc + parseFloat(order.total_amount || 0), 0);
      const totalExpenses = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount || 0), 0);
      
      // Calculate breakdown
      const breakdown = expenses.reduce((acc, exp) => {
        const cat = exp.category || 'Other';
        acc[cat] = (acc[cat] || 0) + parseFloat(exp.amount || 0);
        return acc;
      }, {});

      const categoryArray = Object.keys(breakdown).map(cat => ({
        label: cat,
        value: totalExpenses > 0 ? Math.round((breakdown[cat] / totalExpenses) * 100) : 0,
        amount: breakdown[cat],
        color: cat === 'Supplies' ? 'bg-emerald-500' : cat === 'Utilities' ? 'bg-amber-500' : 'bg-blue-600'
      }));

      setData({
        revenue: totalRevenue,
        expenses: totalExpenses,
        list: expenses,
        categories: categoryArray.sort((a,b) => b.value - a.value)
      });
    } catch (err) {
      console.error('Financial Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'rent': return Home;
      case 'utilities': return UtilityPole;
      case 'supplies': return Coffee;
      case 'payroll': return Briefcase;
      default: return DollarSign;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
         <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
         <p className="font-bold uppercase tracking-widest text-xs">Generating Financial Statement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {showScanner && (
        <AIScanner 
          onClose={() => setShowScanner(false)} 
          onUploadSuccess={() => {
            fetchFinancials();
            setShowScanner(false);
          }} 
        />
      )}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Summary</h2>
          <p className="text-slate-500 text-sm">Track your revenue, expenses, and net profit margins.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-700 font-semibold shadow-sm hover:bg-slate-50 transition-all">
             Export Report
           </button>
           <button 
             onClick={() => setShowScanner(true)}
             className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
           >
             <Scan size={18} />
             AI Add Expense
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-8 rounded-[32px] bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-emerald-500 text-[10px] font-black flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full uppercase">
              LIVE REVENUE
            </span>
          </div>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</div>
          <div className="text-3xl font-black text-slate-900 tracking-tighter">${data.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <span className="text-red-500 text-[10px] font-black flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full uppercase">
              ACTUAL COSTS
            </span>
          </div>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Expenses</div>
          <div className="text-3xl font-black text-slate-900 tracking-tighter">${data.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 relative overflow-hidden group bg-gradient-to-br from-white to-blue-50/30 font-black">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
              <DollarSign size={24} />
            </div>
            <span className="text-blue-600 text-[10px] font-black flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full uppercase">
              NET MARGIN {data.revenue > 0 ? Math.round(((data.revenue - data.expenses) / data.revenue) * 100) : 0}%
            </span>
          </div>
          <div className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">Net Profit</div>
          <div className="text-3xl font-black text-slate-900 tracking-tighter">${(data.revenue - data.expenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Financial Ledger</h3>
              <button className="text-blue-600 font-bold hover:underline text-xs uppercase tracking-widest">History</button>
           </div>
           <table className="w-full text-left">
             <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {Array.isArray(data.list) && data.list.length > 0 ? data.list.map(ex => {
                  const Icon = getIcon(ex.category);
                  return (
                    <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{ex.description}</div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{ex.category || 'Legacy'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-bold text-xs">{ex.expense_date}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">-${parseFloat(ex.amount).toFixed(2)}</td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400 italic">No expense records found.</td>
                  </tr>
                )}
             </tbody>
           </table>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-black text-slate-800 text-lg mb-6 uppercase tracking-tight">Expense Breakdown</h3>
           <div className="space-y-6">
              {Array.isArray(data.categories) && data.categories.length > 0 ? data.categories.map(item => (
                <div key={item.label} className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-900">{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-10">Waiting for ledger data...</p>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
