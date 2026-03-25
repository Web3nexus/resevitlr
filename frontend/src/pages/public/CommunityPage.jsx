import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Instagram, Twitter, MapPin, ArrowUpRight, Flame, Facebook } from 'lucide-react';
import centralApi from '../../services/centralApi';

export default function CommunityPage() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await centralApi.get('saas/settings');
        setSettings(res.data);
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    fetchSettings();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="w-full relative px-6 py-20 md:py-32 overflow-hidden bg-slate-950 min-h-screen flex items-center">
        {/* Deep glows */}
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[400px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-6xl mx-auto relative z-10 w-full">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
                
                {/* Left Side: Heavy Typography */}
                <div className="lg:w-1/2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-6">
                        <Flame className="w-4 h-4" /> 10,000+ Active Members
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-8"
                    >
                        Join the next wave of operators.
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 leading-relaxed mb-12"
                    >
                        Connect with independent restaurant owners, franchise operators, and the Resevit product team. Share setups, discuss workflows, and help shape our roadmap.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <a href={settings.whatsapp_channel_url || "https://whatsapp.com/channel/0029VaDP7yS59PwL7REH7h2Y"} target="_blank" rel="noreferrer" className="px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-3">
                            <MessageCircle className="w-5 h-5 fill-white" /> Join WhatsApp Channel
                        </a>
                        <a href={settings.community_url || "#"} target="_blank" rel="noreferrer" className="px-8 py-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-3">
                            Resevit Owners Group
                        </a>
                    </motion.div>
                </div>

                {/* Right Side: Bento Links */}
                <div className="lg:w-1/2 w-full">
                    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-2 gap-4">
                        
                        {/* Instagram Card */}
                        <a href={settings.instagram_url || "#"} className="col-span-2 md:col-span-1 bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-3xl hover:bg-slate-800 hover:border-pink-500/30 transition-all group">
                            <Instagram className="w-8 h-8 text-pink-500 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                                Instagram <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-pink-400 transition-colors" />
                            </h3>
                            <p className="text-sm text-slate-400">Follow us for restaurant features, visual guides, and product highlights.</p>
                        </a>

                        {/* Twitter Card */}
                        <a href={settings.twitter_url || "#"} className="col-span-2 md:col-span-1 bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-3xl hover:bg-slate-800 hover:border-blue-500/30 transition-all group">
                            <Twitter className="w-8 h-8 text-[#1DA1F2] mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                                X (Twitter) <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                            </h3>
                            <p className="text-sm text-slate-400">Follow for rapid-fire product updates and restaurant industry insights.</p>
                        </a>

                        {/* Facebook Card */}
                        <a href={settings.facebook_url || "#"} className="col-span-2 bg-gradient-to-br from-blue-900/30 to-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all group flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="shrink-0 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Facebook className="w-10 h-10 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 flex justify-center md:justify-start items-center gap-2">
                                    Facebook Community <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                </h3>
                                <p className="text-slate-400">Join our official page to connect with other operators and stay updated on the latest Resevit events and success stories.</p>
                            </div>
                        </a>

                    </motion.div>
                </div>
            </div>
        </div>
    </div>
  );
}
