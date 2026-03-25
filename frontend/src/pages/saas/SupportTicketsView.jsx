import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, CheckCircle, Clock, AlertCircle, MoreVertical, X } from 'lucide-react';
import api from '../../services/centralApi';

export default function SupportTicketsView() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('saas/tickets');
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/saas/tickets/${id}`, { status });
      fetchTickets();
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      console.error("Failed to update ticket", error);
    }
  };

  const filteredTickets = Array.isArray(tickets) ? tickets.filter(t => {
    const matchesSearch = t?.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t?.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || t?.status === activeTab;
    return matchesSearch && matchesTab;
  }) : [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Support Tickets</h1>
          <p className="text-slate-400 text-sm mt-1">Manage tenant inquiries and system assistance requests.</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
           {['all', 'open', 'in_progress', 'resolved'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
           ))}
        </div>

        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-slate-800/20 rounded-2xl animate-pulse border border-slate-800" />)
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-3xl">
             <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="text-slate-500 font-medium">No tickets found.</p>
          </div>
        ) : (
          (Array.isArray(filteredTickets) ? filteredTickets : []).map(ticket => (
            <div 
              key={ticket.id} 
              className="group bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl border ${
                     ticket.status === 'resolved' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                     ticket.status === 'in_progress' ? 'bg-amber-500/10 border-amber-500/20' : 
                     'bg-blue-500/10 border-blue-500/20'
                   }`}>
                      {getStatusIcon(ticket.status)}
                   </div>
                   <div>
                      <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{ticket.subject}</h3>
                      <p className="text-slate-500 text-xs">ID: #{ticket.id.toString().padStart(4, '0')} • {new Date(ticket.created_at).toLocaleString()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                     ticket.priority === 'urgent' ? 'bg-red-500 text-white' :
                     ticket.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                     'bg-slate-700 text-slate-400'
                   }`}>{ticket.priority}</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">{ticket.message}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                       {ticket.tenant_id?.substring(0,2) || '??'}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{ticket.tenant_id || 'Global User'}</span>
                 </div>
                 <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">
                    View Thread
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
           <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col p-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                       <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{selectedTicket.subject}</h3>
                        <p className="text-slate-500 text-sm">Priority: <span className="text-slate-300 capitalize">{selectedTicket.priority}</span></p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                 </button>
              </div>

              <div className="flex-1 space-y-6">
                 <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                          {selectedTicket.tenant_id?.substring(0,2) || '??'}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">{selectedTicket.tenant_id || 'System User'}</p>
                          <p className="text-[10px] text-slate-500">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                       </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Quick Action: Status Update</label>
                       <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => updateStatus(selectedTicket.id, 'open')}
                            className={`py-3 rounded-xl border text-xs font-bold transition-all ${selectedTicket.status === 'open' ? 'bg-blue-600/10 border-blue-600 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                          >
                             OPEN
                          </button>
                          <button 
                            onClick={() => updateStatus(selectedTicket.id, 'in_progress')}
                            className={`py-3 rounded-xl border text-xs font-bold transition-all ${selectedTicket.status === 'in_progress' ? 'bg-amber-600/10 border-amber-600 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                          >
                             IN PROGRESS
                          </button>
                          <button 
                            onClick={() => updateStatus(selectedTicket.id, 'resolved')}
                            className={`py-3 rounded-xl border text-xs font-bold transition-all ${selectedTicket.status === 'resolved' ? 'bg-emerald-600/10 border-emerald-600 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                          >
                             RESOLVED
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800 flex gap-4">
                 <textarea 
                    placeholder="Type your response..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white resize-none h-24 focus:ring-2 focus:ring-blue-600 outline-none"
                 />
                 <button className="px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all">
                    Send Reply
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
