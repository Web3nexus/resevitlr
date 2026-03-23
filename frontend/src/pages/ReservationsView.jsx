import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MessageSquare, CheckCircle, CircleX as XCircle, Clock4, Search, Filter, Loader2 } from 'lucide-react'
import api from '../services/api'

export function ReservationsView() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [showModal, setShowModal] = useState(false);
  const [newReservation, setNewReservation] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    special_requests: ''
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations');
      const reservationData = res.data || [];
      setReservations(reservationData);
      
      // Calculate mini stats
      const counts = reservationData.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: reservationData.length,
        pending: counts.pending || 0,
        confirmed: counts.confirmed || 0,
        cancelled: counts.cancelled || 0
      });
    } catch (err) {
      console.error('Reservation Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      fetchReservations();
    } catch (err) {
      console.error('Status Update Failed:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time for backend
      const combinedTime = `${newReservation.reservation_date} ${newReservation.reservation_time}:00`;
      await api.post('/reservations', {
        ...newReservation,
        reservation_time: combinedTime
      });
      setShowModal(false);
      setNewReservation({ customer_name: '', customer_email: '', customer_phone: '', reservation_date: '', reservation_time: '', party_size: 2, special_requests: '' });
      fetchReservations();
    } catch (err) {
      console.error('Creation Failed:', err);
      alert('Failed to schedule booking. Ensure all fields are filled properly.');
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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Guest Ledger</h2>
          <p className="text-slate-500 text-sm font-medium">Coordinate bookings and guest arrivals.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Volume', value: stats.total, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Pending', value: stats.pending, icon: Clock4, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
         ].map(stat => (
           <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-colors">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                 <stat.icon size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden text-sm">
         <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
            <div className="flex items-center gap-4 flex-1">
               <div className="relative flex-1 max-w-sm group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input type="text" placeholder="Search guests..." className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium text-slate-700" />
               </div>
               <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors shadow-sm">
                  <Filter size={18} />
               </button>
            </div>
            <div className="flex border border-slate-200 rounded-xl p-1 bg-white shadow-sm">
               {['Today', 'This Week', 'All'].map(tab => (
                 <button key={tab} className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'Today' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`}>{tab}</button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5">Guest Information</th>
                    <th className="px-8 py-5">Schedule</th>
                    <th className="px-8 py-5">Party</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Integrations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {Array.isArray(reservations) && reservations.length > 0 ? reservations.map(res => {
                    const dateObj = new Date(res.reservation_time);
                    const dateStr = dateObj.toLocaleDateString();
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-5">
                          <div className="font-black text-slate-900 uppercase tracking-tight text-sm">{res.customer_name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 font-bold uppercase tracking-tight truncate max-w-[200px]">
                             <MessageSquare size={12} className="text-blue-500 shrink-0" /> {res.special_requests || 'Routine Booking'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{res.customer_phone}</div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5 font-black text-slate-700 text-xs">
                             <Clock size={16} className="text-emerald-500" />
                             {timeStr}
                          </div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                             {dateStr}
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5 font-black text-slate-900">
                             <Users size={18} className="text-slate-300" />
                             {res.party_size} <span className="text-[10px] text-slate-400 uppercase tracking-widest">COVERS</span>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            res.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {res.status}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {res.status === 'pending' && (
                               <>
                                 <button 
                                   onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                                   className="p-1 px-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 active:scale-95 transition-all"
                                 >
                                    Confirm
                                 </button>
                                 <button 
                                   onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                                   className="p-1 px-4 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-200 active:scale-95 transition-all"
                                 >
                                    Decline
                                 </button>
                               </>
                             )}
                             {res.status === 'confirmed' && (
                               <button 
                                 onClick={() => handleStatusUpdate(res.id, 'completed')}
                                 className="p-1 px-4 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-900 transition-all"
                               >
                                  Seat Guest
                               </button>
                             )}
                          </div>
                       </td>
                    </tr>
                  )}) : (
                    <tr>
                       <td colSpan="5" className="px-8 py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No reservations booked on ledger.</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-lg uppercase tracking-tight">Manual Booking entry</h3>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest Name</label>
                    <input required type="text" value={newReservation.customer_name} onChange={e => setNewReservation({...newReservation, customer_name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
                        <input required type="email" value={newReservation.customer_email} onChange={e => setNewReservation({...newReservation, customer_email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</label>
                        <input required type="text" value={newReservation.customer_phone} onChange={e => setNewReservation({...newReservation, customer_phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="555-0199" />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</label>
                        <input required type="date" value={newReservation.reservation_date} onChange={e => setNewReservation({...newReservation, reservation_date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</label>
                        <input required type="time" value={newReservation.reservation_time} onChange={e => setNewReservation({...newReservation, reservation_time: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Party Size</label>
                        <input required type="number" min="1" value={newReservation.party_size} onChange={e => setNewReservation({...newReservation, party_size: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                     </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Special Requests</label>
                    <textarea value={newReservation.special_requests} onChange={e => setNewReservation({...newReservation, special_requests: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows="2" placeholder="Anniversary, Window seat..."></textarea>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">Submit Booking</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
