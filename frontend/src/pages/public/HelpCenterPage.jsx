import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, HelpCircle, Utensils, CreditCard, LayoutDashboard, Settings, Loader2, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import centralApi from '../../services/centralApi';

export default function HelpCenterPage() {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await centralApi.get('public/help');
            setArticles(res.data);
        } catch (error) {
            console.error('Failed to fetch help articles', error);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = articles.reduce((acc, art) => {
        if (!acc[art.category]) acc[art.category] = [];
        acc[art.category].push(art);
        return acc;
    }, {});

    const filteredArticles = articles.filter(art => 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categoryMeta = {
        'Getting Started': { icon: LayoutDashboard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        'Menu Management': { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        'Billing & Payments': { icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        'Account Settings': { icon: Settings, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Syncing Support Hub...</p>
            </div>
        );
    }

    return (
        <div className="w-full relative px-6 py-20 md:py-32 overflow-hidden bg-slate-950 min-h-screen">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header & Search */}
                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-3xl">
                        <HelpCircle className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8"
                    >
                        How can we help?
                    </motion.h1>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative max-w-3xl mx-auto group"
                    >
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search for articles, guides, or keywords..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/40 backdrop-blur-2xl border border-slate-700 rounded-full py-6 pl-20 pr-10 text-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-3xl shadow-emerald-950/20"
                        />
                        
                        <AnimatePresence>
                            {searchQuery && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-6 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-4xl z-50 overflow-hidden"
                                >
                                    {filteredArticles.length > 0 ? (
                                        <div className="max-h-[500px] overflow-y-auto p-2">
                                            {filteredArticles.map(art => (
                                                <button 
                                                    key={art.id}
                                                    onClick={() => { setSelectedArticle(art); setSearchQuery(''); }}
                                                    className="w-full text-left p-6 hover:bg-slate-800 rounded-2xl flex items-center justify-between group transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-emerald-400">
                                                            <BookOpen size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-bold text-lg">{art.title}</div>
                                                            <div className="text-sm text-slate-500 font-medium">{art.category}</div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-16 text-center text-slate-500 text-lg font-bold">We couldn't find anything matching "{searchQuery}"</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Article View Modal */}
                <AnimatePresence>
                    {selectedArticle && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedArticle(null)} />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-[#0f172a] border border-slate-800 rounded-[3rem] shadow-4xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative z-[101]"
                            >
                                <div className="p-10 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
                                    <div className="flex-1">
                                        <span className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-4 block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">{selectedArticle.category}</span>
                                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">{selectedArticle.title}</h2>
                                    </div>
                                    <button onClick={() => setSelectedArticle(null)} className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 transition-all">
                                        <ChevronRight className="w-8 h-8 rotate-90" />
                                    </button>
                                </div>
                                <div className="p-12 overflow-y-auto flex-1 prose prose-invert prose-emerald max-w-none">
                                    <div className="text-xl text-slate-400 leading-relaxed font-medium mb-10 pb-10 border-b border-slate-800/50 italic">
                                        {selectedArticle.excerpt}
                                    </div>
                                    <div className="text-slate-300 whitespace-pre-wrap text-lg leading-loose">
                                        {selectedArticle.content}
                                    </div>
                                    <div className="mt-20 p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                                            <HelpCircle size={24} />
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-2">Was this article helpful?</h4>
                                        <div className="flex gap-4 mt-4">
                                            <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all">Yes, thanks!</button>
                                            <button className="px-8 py-3 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-full font-bold transition-all">Not quite</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Categories Grid */}
                <motion.div 
                    variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                    initial="initial" animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24"
                >
                    {Object.entries(categories).map(([category, items], i) => {
                        const meta = categoryMeta[category] || { icon: BookOpen, color: 'text-slate-400', bg: 'bg-slate-500/10' };
                        return (
                            <motion.div 
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] hover:bg-slate-800/60 transition-all group cursor-pointer border-t-emerald-500/20"
                                onClick={() => setSearchQuery(category)}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${meta.bg}`}>
                                    <meta.icon className={`w-8 h-8 ${meta.color}`} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 flex items-center justify-between">
                                    {category}
                                    <span className="text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-500 font-bold">{items.length}</span>
                                </h3>
                                <p className="text-slate-500 text-base leading-relaxed mb-8 font-medium">
                                    Explore all sub-articles related to {category.toLowerCase()} within the Resevit ecosystem.
                                </p>
                                <div className="flex items-center gap-3 text-emerald-400 font-bold group-hover:gap-4 transition-all">
                                    View Articles <ChevronRight size={20} />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Support Hub Section */}
                <div className="bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 border border-slate-800 rounded-[3rem] p-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mb-8 rotate-12">
                            <MessageSquare size={32} />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4">Can't find an answer?</h2>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">Our human operators and technical staff are standing by globally to ensure your restaurant operations never skip a beat.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link to="/login" className="px-10 py-5 bg-white text-slate-950 text-lg font-black rounded-2xl hover:bg-emerald-50 transition-all flex items-center gap-3 group">
                                Open Priority Ticket
                                <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Link>
                            <a href="mailto:hq@resevit.com" className="px-10 py-5 bg-slate-800/50 backdrop-blur-md text-white border border-slate-700 text-lg font-black rounded-2xl hover:bg-slate-700 transition-all">
                                Email Staff
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-24 text-center border-t border-slate-800 pt-12">
                    <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">© 2026 Resevit Global Operations • Privacy & Security Enabled</p>
                </div>
            </div>
        </div>
    );
}
