import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Instagram, Facebook, Bot, User, Search, Filter, Loader2, ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function MessagesView() {
    const [interactions, setInteractions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSender, setSelectedSender] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const chatEndRef = useRef(null);

    const fetchInteractions = async () => {
        try {
            const response = await api.get('/automation/activity');
            setInteractions(response.data.activity);
        } catch (error) {
            console.error("Failed to fetch interactions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInteractions();
        const interval = setInterval(fetchInteractions, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedSender, interactions]);

    // Group interactions by sender for the sidebar
    const conversations = interactions.reduce((acc, curr) => {
        if (!acc[curr.sender]) {
            acc[curr.sender] = {
                sender: curr.sender,
                platform: curr.platform,
                lastMessage: curr.content,
                timestamp: curr.timestamp,
                time: curr.time,
                unread: curr.status === 'Thinking...',
                messages: []
            };
        }
        acc[curr.sender].messages.push(curr);
        return acc;
    }, {});

    const sortedConversations = Object.values(conversations).sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedSender || isSending) return;

        const lastInteraction = conversations[selectedSender].messages[0];
        setIsSending(true);
        try {
            await api.post(`/automation/interactions/${lastInteraction.id}/reply`, {
                reply: replyText
            });
            setReplyText('');
            fetchInteractions();
        } catch (error) {
            alert("Failed to send reply");
        } finally {
            setIsSending(false);
        }
    };

    const activeChatMessages = selectedSender ? conversations[selectedSender].messages.slice().reverse() : [];

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 bg-white rounded-[32px] border border-slate-200 flex flex-col overflow-hidden shadow-sm ${selectedSender ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl py-2 pl-10 pr-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Syncing Hub...</p>
                        </div>
                    ) : sortedConversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No active chats</p>
                        </div>
                    ) : (
                        sortedConversations.map(conv => (
                            <button 
                                key={conv.sender}
                                onClick={() => setSelectedSender(conv.sender)}
                                className={`w-full p-6 text-left hover:bg-slate-50 transition-all flex gap-4 relative group ${selectedSender === conv.sender ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm uppercase group-hover:bg-white group-hover:shadow-md transition-all">
                                        {conv.sender.substring(0, 2)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                        {conv.platform === 'Instagram' ? <Instagram size={12} className="text-pink-500" /> : 
                                         conv.platform === 'Facebook' ? <Facebook size={12} className="text-blue-600" /> : 
                                         <MessageSquare size={12} className="text-emerald-500" />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-black text-slate-900 truncate uppercase text-xs tracking-tight">{conv.sender}</span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase">{conv.time}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 truncate lowercase">{conv.lastMessage}</p>
                                </div>
                                {conv.unread && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 bg-white rounded-[32px] border border-slate-200 flex flex-col overflow-hidden shadow-sm ${!selectedSender ? 'hidden md:flex' : 'flex'}`}>
                {selectedSender ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedSender(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-xl">
                                    <ArrowLeft size={20} className="text-slate-600" />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 font-bold text-xs uppercase border border-slate-100">
                                    {selectedSender.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">{selectedSender}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{conversations[selectedSender].platform} Connected</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
                                    <Bot size={20} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
                                    <Filter size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {activeChatMessages.map((msg, idx) => (
                                <div key={msg.id} className="space-y-4">
                                    {/* User Message */}
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%]">
                                            <div className="bg-slate-100 p-4 rounded-3xl rounded-tl-none border border-slate-200">
                                                <p className="text-xs font-bold text-slate-700 leading-relaxed">{msg.content}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 ml-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">{msg.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI (or manual) Reply */}
                                    <div className="flex justify-end">
                                        <div className="max-w-[80%] text-right space-y-2">
                                            <div className={`p-4 rounded-3xl rounded-tr-none border shadow-sm ${
                                                msg.status === 'manual_reply' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-blue-50/50 text-slate-800 border-blue-100'
                                            }`}>
                                                <p className="text-xs font-bold leading-relaxed">{msg.reply}</p>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                                    msg.status === 'replied' ? 'bg-blue-100 text-blue-600' : 
                                                    msg.status === 'manual_reply' ? 'bg-indigo-100 text-indigo-600' : 
                                                    'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {msg.status === 'manual_reply' ? <User size={10} /> : <Bot size={10} />}
                                                    {msg.status === 'manual_reply' ? 'Manual Agent' : 'AI Assistant'}
                                                </div>
                                                {msg.type === 'booking' && (
                                                    <div className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <CheckCircle size={10} />
                                                        Auto-Booked
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Reply Input */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                            <form onSubmit={handleSendReply} className="relative">
                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your response... (Overrides AI)"
                                    className="w-full bg-white border border-slate-200 rounded-3xl py-4 pl-6 pr-16 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
                                    rows={2}
                                />
                                <button 
                                    type="submit"
                                    disabled={!replyText.trim() || isSending}
                                    className="absolute right-4 bottom-4 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:bg-slate-200 disabled:shadow-none active:scale-95"
                                >
                                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3 text-center">
                                Tip: Sending a manual reply will pause autonomous AI for this session.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                        <div className="w-24 h-24 rounded-[40px] bg-white shadow-xl shadow-blue-500/5 flex items-center justify-center mb-8 border border-slate-100">
                            <Bot size={48} className="text-blue-600 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Central Messaging Hub</h3>
                        <p className="text-slate-500 text-sm font-medium max-w-sm">
                            Monitor and manage all communications from WhatsApp, Facebook, Instagram, and Web. Select a conversation to begin.
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                <CheckCircle className="text-emerald-500 w-5 h-5" />
                                <span className="text-[10px] font-black text-slate-600 uppercase">AI Monitoring Active</span>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                <Clock className="text-blue-500 w-5 h-5" />
                                <span className="text-[10px] font-black text-slate-600 uppercase">Real-time Sync</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
