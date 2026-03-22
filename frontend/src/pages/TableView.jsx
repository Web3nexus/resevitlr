import React, { useState, useEffect } from 'react'
import { Plus, Grid, List, Table as TableIcon, Loader2, Circle, MoreVertical, LayoutGrid } from 'lucide-react'
import api from '../services/api'

export function TableView() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [newTable, setNewTable] = useState({ table_number: '', capacity: 2 });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data);
    } catch (err) {
      console.error('Table Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/tables/${id}/status`, { status: newStatus });
      fetchTables(); // Refresh
    } catch (err) {
      console.error('Status Update Failed:', err);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tables', newTable);
      setShowModal(false);
      setNewTable({ table_number: '', capacity: 2 });
      fetchTables();
    } catch (err) {
      console.error('Failed to add table:', err);
      alert('Failed to add table. Check if table number already exists.');
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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Floor Operations</h2>
          <p className="text-slate-500 text-sm font-medium">Design and monitor your restaurant seating arrangement.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
           </div>
           <button 
             onClick={() => setShowModal(true)}
             className="flex items-center gap-3 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
           >
             <Plus size={18} strokeWidth={3} /> Add Table
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
         {tables.length > 0 ? tables.map(table => (
           <div key={table.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-4 group hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/5 transition-all text-center cursor-default relative overflow-hidden active:scale-95">
             
             <div className="absolute top-4 right-4 group-hover:block hidden animate-in fade-in">
                <button className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                   <MoreVertical size={16} />
                </button>
             </div>

             <div className={`h-20 w-20 rounded-3xl flex items-center justify-center transition-all shadow-inner group-hover:scale-110 ${
                table.status === 'available' ? 'bg-slate-50 text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500' : 
                table.status === 'occupied' ? 'bg-blue-50 text-blue-600' : 
                'bg-slate-100 text-slate-400'
             }`}>
                <TableIcon size={36} strokeWidth={1.5} />
             </div>
             
             <div>
               <div className="font-black text-slate-900 text-xl tracking-tighter uppercase">{table.table_number || table.number}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{table.capacity} Guest Capacity</div>
             </div>

             <div className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border flex items-center gap-2 ${
               table.status === 'available' ? 'border-emerald-100 text-emerald-600 bg-emerald-50/50' : 
               table.status === 'occupied' ? 'border-blue-100 text-blue-600 bg-blue-50' : 
               'border-slate-200 text-slate-400 bg-slate-50'
             }`}>
               <Circle size={6} fill="currentColor" className={table.status === 'occupied' ? 'animate-pulse' : ''} />
               {table.status}
             </div>
             
             {/* Quick status toggle for demo/staff */}
             <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                <button 
                  onClick={() => handleStatusUpdate(table.id, table.status === 'available' ? 'occupied' : 'available')}
                  className="text-[8px] font-black uppercase tracking-tighter bg-slate-50 text-slate-400 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-slate-100"
                >
                  {table.status === 'available' ? 'Seat' : 'Clear'}
                </button>
                <button 
                  onClick={() => handleStatusUpdate(table.id, 'reserved')}
                  className="text-[8px] font-black uppercase tracking-tighter bg-slate-50 text-slate-400 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                >
                  Reserve
                </button>
             </div>
           </div>
         )) : (
            <div className="col-span-full py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50/50">
               No floor plan configurations found.
            </div>
         )}
      </div>

      {/* Add Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-lg mb-4 text-slate-900">Add New Table</h3>
              <form onSubmit={handleAddTable} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Table Number</label>
                    <input required type="text" value={newTable.table_number} onChange={e => setNewTable({...newTable, table_number: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" placeholder="e.g. 12 or Patio-1" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Capacity (Seats)</label>
                    <input required type="number" min="1" value={newTable.capacity} onChange={e => setNewTable({...newTable, capacity: parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" />
                 </div>
                 <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100 transition-colors">Cancel</button>
                    <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-slate-800 transition-colors">Save Table</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
