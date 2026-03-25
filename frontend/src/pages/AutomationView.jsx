import React, { useState, useEffect } from 'react'
import { Bot, MessageSquare, Instagram, Facebook, Star, Loader2, TrendingUp, CheckCircle, Clock, Search, Filter, Save, Settings, FileText, Plus, Trash2, FileUp, Database, Sparkles, ChevronRight, Activity, Globe } from 'lucide-react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function AutomationView() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [knowledge, setKnowledge] = useState([]);
  const [businessContext, setBusinessContext] = useState({ menu: '', tables: '' });

  const [savingSettings, setSavingSettings] = useState(false);
  const [aiSettings, setAiSettings] = useState({
    ai_tone: 'Professional',
    custom_instructions: '',
    auto_reply_enabled: false,
    social_whatsapp: false,
    social_facebook: false,
    social_instagram: false
  });

  const [newKnowledge, setNewKnowledge] = useState({ title: '', content: '', type: 'note' });
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);

  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [linkingChannel, setLinkingChannel] = useState(null);
  const [platformId, setPlatformId] = useState('');

  useEffect(() => {
    fetchActivity();
    fetchSettings();
    fetchKnowledge();
    // In a real app, we'd have an endpoint for this, but for now we'll simulate or fetch from others
  }, []);

  const fetchActivity = async () => {
    try {
      const res = await api.get('automation/activity');
      setData(res.data);
    } catch (err) {
      console.error('Automation Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('automation/settings');
      setAiSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch AI Settings:', err);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const res = await api.get('automation/knowledge');
      setKnowledge(res.data);
    } catch (err) {
      console.error('Failed to fetch Knowledge:', err);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.post('automation/settings', aiSettings);
      alert('AI Configuration saved successfully!');
    } catch (err) {
      console.error('Failed to save AI settings:', err);
      alert('Error saving configuration.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddKnowledge = async (e) => {
    e.preventDefault();
    setIsAddingKnowledge(true);
    try {
      await api.post('automation/knowledge', newKnowledge);
      setNewKnowledge({ title: '', content: '', type: 'note' });
      fetchKnowledge();
    } catch (err) {
      alert("Failed to add knowledge");
    } finally {
      setIsAddingKnowledge(false);
    }
  };

  const handleSocialToggle = (platform) => {
    if (aiSettings[platform.id]) {
      const newSettings = { ...aiSettings, [platform.id]: false };
      setAiSettings(newSettings);
      api.post('automation/settings', newSettings);
    } else {
      setLinkingChannel(platform);
      setPlatformId(aiSettings[platform.id.replace('social_', '') + '_id'] || '');
      setIsLinkingModalOpen(true);
    }
  };

  const handleLinkChannel = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    const platformKey = linkingChannel.id;
    const idKey = platformKey.replace('social_', '') + '_id';

    try {
        await api.patch('automation/social-links', { [idKey]: platformId });
        const newSettings = { ...aiSettings, [platformKey]: true };
        await api.post('automation/settings', newSettings);
        setAiSettings(newSettings);
        setIsLinkingModalOpen(false);
        setPlatformId('');
    } catch (err) {
        alert("Linking failed. Please check the ID.");
    } finally {
        setSavingSettings(false);
    }
  };

  const simulateInteraction = async () => {
    const tempId = Date.now();
    const newInteraction = {
      id: tempId,
      platform: 'Instagram',
      sender: '@new_fan_123',
      content: 'Just had the best dinner ever! Highly recommend the signature burger.',
      status: 'Thinking...',
      reply: 'Processing autonomous response...',
      time: 'Just now',
      sentiment: 'positive',
      isThinking: true
    };
    
    setData(prev => ({
      ...prev,
      activity: [newInteraction, ...(prev?.activity || [])]
    }));

    try {
      await api.post('automation/webhook/social', {
        message: { text: newInteraction.content, sender: newInteraction.sender, platform: newInteraction.platform },
        user: { name: newInteraction.sender }
      });
      fetchActivity();
    } catch (err) {
      console.error('Simulation Failed:', err);
      fetchActivity();
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center py-20"><Loader2 size={40} className="animate-spin text-blue-600" /></div>;

  const tabs = [
    { id: 'overview', label: 'Monitor', icon: Activity },
    { id: 'social', label: 'Channels', icon: Globe },
    { id: 'engine', label: 'AI Core', icon: Sparkles },
    { id: 'knowledge', label: 'Knowledge', icon: Database },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Bot size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">AI Command Hub</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Neural Engine Online & Synchronized</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/dashboard/messages" className="bg-white text-slate-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 flex items-center gap-2 active:scale-95 shadow-sm">
              <MessageSquare size={14} />
              Open Inbox
           </Link>
           <button onClick={simulateInteraction} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95">
              <Sparkles size={14} className="text-blue-400" />
              Test Engine
           </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-[24px] w-fit border border-slate-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><CheckCircle size={24} /></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precision</span>
               </div>
               <div className="text-5xl font-black text-slate-900 tracking-tighter">{data.stats.accuracy || '99%'}</div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{data.stats.total_interactions} Neural Passes</p>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Activity size={24} /></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autonomous</span>
               </div>
               <div className="text-5xl font-black text-slate-900 tracking-tighter">{data.stats.auto_replies}</div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Closed Loops</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={100} className="text-white" /></div>
               <div className="flex items-center justify-between mb-8 relative z-10 text-white">
                  <div className="h-12 w-12 bg-white/10 text-white rounded-2xl flex items-center justify-center"><Star size={24} /></div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Feedback</span>
               </div>
               <div className="text-5xl font-black text-white tracking-tighter relative z-10">{data.stats.sentiment_score}% Positive</div>
               <div className="flex gap-1 mt-4 relative z-10">
                  <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${data.stats.sentiment_score}%` }}></div>
                  <div className="h-1.5 bg-slate-700 rounded-full flex-1"></div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Live Neutral Interaction Log</h3>
                <Link to="/dashboard/messages" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                  View Full Inbox <ChevronRight size={14} />
                </Link>
             </div>
             <div className="divide-y divide-slate-50">
                {data.activity.slice(0, 5).map(item => (
                   <div key={item.id} className="p-8 hover:bg-slate-50/50 transition-all flex gap-8 group">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:shadow-xl group-hover:text-blue-500 transition-all border border-slate-100/50">
                         {item.platform === 'Instagram' ? <Instagram size={24} /> : item.platform === 'Facebook' ? <Facebook size={24} /> : <MessageSquare size={24} />}
                      </div>
                      <div className="flex-1 space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <span className="font-black text-slate-900 tracking-tight uppercase text-xs">{item.sender}</span>
                               <span className="text-[9px] font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200/50">{item.platform}</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.time}</span>
                         </div>
                         <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/50 relative">
                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{item.content}"</p>
                         </div>
                         <div className="flex items-start gap-4 pl-6 border-l-2 border-blue-500/20">
                            <Bot size={18} className="text-blue-600 mt-1" />
                            <div className="flex-1">
                               <div className="flex items-center gap-3 mb-1.5">
                                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">AI Result</span>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${item.status === 'replied' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse'}`}>{item.status}</span>
                               </div>
                               <p className="text-xs font-black text-slate-800 tracking-tight leading-relaxed">{item.reply}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Social Channels Tab */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm animate-in zoom-in-95 duration-300">
           <div className="max-w-3xl mb-12">
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl mb-2">Connected Channels</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">AI Resevit monitors these platforms in real-time. Connect your professional accounts to enable autonomous lead capturing and reservations.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                  { name: 'WhatsApp Business', id: 'social_whatsapp', icon: <MessageSquare size={28} />, connected: aiSettings.social_whatsapp, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Secure direct messaging' },
                  { name: 'Facebook Page', id: 'social_facebook', icon: <Facebook size={28} />, connected: aiSettings.social_facebook, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Auto-reply to comments' },
                  { name: 'Instagram Creator', id: 'social_instagram', icon: <Instagram size={28} />, connected: aiSettings.social_instagram, color: 'text-pink-500', bg: 'bg-pink-50', desc: 'Capture story mentions' },
              ].map(platform => (
                  <div key={platform.name} className="p-8 rounded-[40px] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
                      <div className="flex items-start justify-between mb-10">
                          <div className={`h-16 w-16 rounded-[24px] ${platform.bg} ${platform.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                              {platform.icon}
                          </div>
                      </div>
                      <div className="space-y-4">
                          <div>
                            <h4 className="font-black text-slate-900 tracking-tight text-sm uppercase mb-1">{platform.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{platform.desc}</p>
                          </div>
                          <button 
                              onClick={() => handleSocialToggle(platform)}
                              className={`w-full py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                              platform.connected 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95'
                          }`}>
                              {platform.connected ? 'Channel Online' : 'Link Account'}
                          </button>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      )}

      {/* AI Engine Tab */}
      {activeTab === 'engine' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
                 <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none rotate-12">
                    <Sparkles size={300} className="text-white" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center"><Bot size={24} className="text-white" /></div>
                       <h3 className="font-black text-white text-xl uppercase tracking-tight">Neural Configuration</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Tone</label>
                          <select 
                            value={aiSettings.ai_tone}
                            onChange={(e) => setAiSettings({...aiSettings, ai_tone: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-sm"
                          >
                             <option value="Professional">Professional & Precise</option>
                             <option value="Friendly">Warm & Welcoming</option>
                             <option value="Casual">Casual & Energetic</option>
                             <option value="Humorous">Smart & Witty</option>
                          </select>
                       </div>
                       <div className="flex items-center pt-8">
                          <label className="flex items-center gap-4 cursor-pointer group">
                             <div className="relative">
                                <input type="checkbox" checked={aiSettings.auto_reply_enabled} onChange={(e) => setAiSettings({...aiSettings, auto_reply_enabled: e.target.checked})} className="sr-only" />
                                <div className={`w-14 h-7 rounded-full transition-colors ${aiSettings.auto_reply_enabled ? 'bg-blue-500' : 'bg-white/10'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${aiSettings.auto_reply_enabled ? 'translate-x-7' : ''}`}></div>
                             </div>
                             <span className="text-xs font-black text-white uppercase tracking-widest">Autonomous Control</span>
                          </label>
                       </div>
                    </div>

                    <div className="mb-10">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Specific Guardrails & Rules</label>
                       <textarea 
                          value={aiSettings.custom_instructions}
                          onChange={(e) => setAiSettings({...aiSettings, custom_instructions: e.target.value})}
                          rows={6}
                          placeholder="e.g. 'Never offer discounts on weekends. Always mention our signature cocktails. Be helpful but brief.'"
                          className="w-full bg-white/5 border border-white/10 text-white rounded-[32px] py-6 px-8 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 font-medium text-sm leading-relaxed"
                       />
                    </div>

                    <button onClick={saveSettings} disabled={savingSettings} className="w-full bg-white text-slate-900 py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50">
                       {savingSettings ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                       Sync Cloud Core
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                 <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                    <Database size={14} className="text-blue-600" /> Neural Context
                 </h4>
                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-[10px] font-bold text-slate-500">
                       "AI is currently training on your Menu items and Floor Plan for real-time accuracy."
                    </div>
                    <div className="divide-y divide-slate-100">
                       <div className="py-3 flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-slate-400">Model</span>
                          <span className="text-slate-800">Resevit-GPT-4o</span>
                       </div>
                       <div className="py-3 flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-slate-400">Context Window</span>
                          <span className="text-slate-800">128k Tokens</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-600/20">
                 <Sparkles size={24} className="mb-4 opacity-50" />
                 <h4 className="font-black uppercase tracking-tighter text-lg mb-2">Advanced Logic</h4>
                 <p className="text-[10px] font-bold text-blue-100 leading-relaxed uppercase tracking-widest italic">Switching to 'Pro' tone enables more complex negotiation and menu upsells during interaction.</p>
              </div>
           </div>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
           {/* Document Upload / Add Hub */}
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><FileText size={24} /></div>
                 <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl">Increase Brain Power</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Add documents for AI guardrails</p>
                 </div>
              </div>

              <form onSubmit={handleAddKnowledge} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Document Title</label>
                    <input 
                       type="text" 
                       value={newKnowledge.title}
                       onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                       required
                       placeholder="e.g. Refund Policy or Holiday Rules"
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Entry Type</label>
                       <select 
                          value={newKnowledge.type}
                          onChange={(e) => setNewKnowledge({...newKnowledge, type: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm appearance-none"
                       >
                          <option value="note">Internal Note</option>
                          <option value="policy">Legal Policy</option>
                          <option value="document">Full Document</option>
                       </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Source File</label>
                        <div className="relative group">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            <div className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 text-slate-400 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all font-black text-[10px] uppercase tracking-widest">
                                <FileUp size={16} /> Upload Doc
                            </div>
                        </div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Content / Guardrail Text</label>
                    <textarea 
                       value={newKnowledge.content}
                       onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                       rows={6}
                       placeholder="Paste policy text or detailed instructions here..."
                       className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 px-8 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm leading-relaxed"
                    />
                 </div>
                 <button type="submit" disabled={isAddingKnowledge} className="group relative w-full bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all overflow-hidden">
                    {isAddingKnowledge ? <Loader2 size={24} className="animate-spin mx-auto" /> : (
                       <span className="flex items-center justify-center gap-3">
                          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
                          Ingest Knowledge
                       </span>
                    )}
                 </button>
              </form>
           </div>

           {/* Ingested List */}
           <div className="space-y-8">
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                 <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8">Active Knowledge Base</h3>
                 <div className="space-y-4">
                    {knowledge.length === 0 ? (
                       <div className="text-center py-10 opacity-30">
                          <Database size={40} className="mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Neural Database Empty</p>
                       </div>
                    ) : (
                       knowledge.map(k => (
                          <div key={k.id} className="p-6 rounded-[32px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group">
                             <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                   <div className={`p-3 rounded-xl ${k.type === 'policy' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                      <FileText size={20} />
                                   </div>
                                   <div>
                                      <h4 className="font-black text-slate-900 tracking-tight uppercase text-xs">{k.title}</h4>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{k.type} | Active</span>
                                   </div>
                                </div>
                                <button className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                             </div>
                             {k.content && (
                                <p className="mt-4 text-[10px] font-medium text-slate-500 line-clamp-2 leading-relaxed italic border-l-2 border-slate-200 pl-4">{k.content}</p>
                             )}
                          </div>
                       ))
                    )}
                 </div>
              </div>
              <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                 <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Activity size={120} /></div>
                 <h4 className="font-black uppercase tracking-tighter text-lg mb-2 relative z-10">Real-time Sync</h4>
                 <p className="text-[10px] font-bold text-emerald-100 leading-relaxed uppercase tracking-widest italic relative z-10">Newly ingested documents are parsed and injected into the AI context window within seconds.</p>
              </div>
           </div>
        </div>
      )}
      {/* Linking Modal */}
      {isLinkingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[48px] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="p-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${linkingChannel.bg} ${linkingChannel.color}`}>
                       {linkingChannel.icon}
                    </div>
                    <div>
                       <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl">Link {linkingChannel.name}</h3>
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Seamless Integration Protocol</p>
                    </div>
                 </div>

                 <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed">
                    Enter your {linkingChannel.name} ID below. This enables Resevit to monitor your incoming messages and deploy the Neural Engine for autonomous replies.
                 </p>

                 <form onSubmit={handleLinkChannel} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                           {linkingChannel.id === 'social_whatsapp' ? 'Phone Number ID' : 'Facebook Page ID'}
                        </label>
                        <input 
                           type="text"
                           value={platformId}
                           onChange={(e) => setPlatformId(e.target.value)}
                           required
                           placeholder={linkingChannel.id === 'social_whatsapp' ? 'e.g. 1092837465' : 'e.g. 5432167890'}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm tracking-widest"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <button 
                          type="button" 
                          onClick={() => setIsLinkingModalOpen(false)}
                          className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                       >
                          Cancel
                       </button>
                       <button 
                          type="submit" 
                          disabled={savingSettings}
                          className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                       >
                          {savingSettings && <Loader2 size={14} className="animate-spin" />}
                          Confirm Link
                       </button>
                    </div>
                 </form>
              </div>
              <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                     Resevit Neural Engine Secured & Encrypted
                  </p>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
