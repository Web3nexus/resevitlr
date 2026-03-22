import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Quote, Loader2, Building2, CheckCircle2, Star } from 'lucide-react';
import centralApi from '../../services/centralApi';

export default function CustomerStoryDetailPage() {
    const { slug } = useParams();
    const [story, setStory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const res = await centralApi.get(`/public/customer-stories`);
                const found = res.data.find(s => s.slug === slug);
                setStory(found);
            } catch (error) {
                console.error('Failed to fetch customer story', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStory();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                <p className="text-slate-500 font-mono text-sm tracking-widest uppercase italic">Loading Enterprise Impact Analytics...</p>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-white mb-4">Story not found.</h1>
                <p className="text-slate-400 mb-8 max-w-md">The case study you are looking for might have been moved or archived.</p>
                <Link to="/customers" className="px-8 py-4 bg-white text-slate-950 font-bold rounded-full hover:bg-slate-200 transition-all">
                    Back to Success Stories
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-32">
            {/* Header / Hero */}
            <div className="max-w-7xl mx-auto px-6 mb-20">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link to="/customers" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold mb-12">
                        <ArrowLeft size={18} /> Success Stories
                    </Link>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-semibold mb-8">
                                <Building2 className="w-4 h-4" /> Case Study: {story.client_name}
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
                                How {story.client_name} unified their entire tech stack.
                            </h1>
                            <p className="text-2xl text-slate-400 leading-relaxed font-medium mb-12">
                                Scaling hospitality operations across multiple locations while maintaining sub-second kitchen response times.
                            </p>
                        </div>
                        
                        <div className="relative">
                           <div className="absolute inset-0 bg-amber-500/10 blur-[120px] rounded-full translate-x-12"></div>
                           <div className="relative bg-slate-900/50 backdrop-blur-3xl border border-slate-800 p-12 rounded-[3.5rem] shadow-4xl transform hover:-rotate-1 transition-transform cursor-default">
                                <Quote className="w-16 h-16 text-amber-500/20 absolute top-8 left-8" />
                                <div className="text-2xl md:text-3xl text-white font-black italic leading-snug mb-8 relative z-10 antialiased">
                                    "{story.content.substring(0, 180)}..."
                                </div>
                                <div className="flex items-center gap-4 border-t border-slate-800 pt-8">
                                    <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black text-2xl">
                                        {story.client_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-white tracking-tight">{story.client_name}</div>
                                        <div className="text-sm text-slate-500 font-medium">Enterprise Partner</div>
                                    </div>
                                </div>
                           </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Metrics Section */}
            <section className="bg-slate-900/30 border-y border-slate-800/50 py-20 mb-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {story.metrics && Object.entries(story.metrics).map(([key, value], idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                                key={key} className="text-center md:text-left border-l-2 border-amber-500/30 pl-8"
                            >
                                <div className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                                    {value} <TrendingUp className="text-amber-500 w-8 h-8" />
                                </div>
                                <div className="text-lg font-bold text-slate-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Body Content */}
            <div className="max-w-4xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="prose prose-invert prose-amber max-w-none text-xl leading-loose text-slate-400 font-medium"
                >
                    <div className="mb-20 pb-20 border-b border-slate-800">
                        <h2 className="text-3xl font-bold text-white mb-10 tracking-tight flex items-center gap-4">
                            <CheckCircle2 className="text-emerald-400" /> The Challenge
                        </h2>
                        <p className="mb-12">
                            Operating at scale in the hospitality industry usually means fighting a losing battle against technical debt. Legacy systems were never designed to communicate in real-time, resulting in data desynchronization that cost {story.client_name} tens of thousands in missing inventory and lost staff hours.
                        </p>
                    </div>

                    <div className="mb-20 pb-20 border-b border-slate-800">
                        <h2 className="text-3xl font-bold text-white mb-10 tracking-tight flex items-center gap-4">
                            <Star className="text-amber-400 fill-amber-400" /> The Result
                        </h2>
                        <p className="mb-8">{story.content}</p>
                        <p>
                            Today, {story.client_name} operates with a lean technical footprint. The overhead of managing multiple API keys, manual CSV exports, and midnight database syncs has been replaced by Resevit's unified real-time stream.
                        </p>
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <div className="mt-32 p-16 bg-gradient-to-br from-amber-600/10 to-slate-900 border border-slate-800 rounded-[3rem] text-center">
                    <h3 className="text-4xl font-black text-white mb-6">Ready to scale like {story.client_name}?</h3>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">Join the world's most ambitious hospitality brands and start building on Resevit today.</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/login" className="px-10 py-5 bg-white text-slate-950 text-lg font-black rounded-2xl hover:bg-amber-100 transition-all">
                            Talk to Enterprise Sales
                        </Link>
                        <Link to="/pricing" className="px-10 py-5 bg-slate-800 text-white text-lg font-black rounded-2xl hover:bg-slate-700 transition-all border border-slate-700">
                            See Self-Serve Plans
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
