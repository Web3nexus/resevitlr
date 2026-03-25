import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/centralApi';

export default function CustomerStoriesPage() {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get('public/customer-stories');
        setStories(response.data || []);
      } catch (error) {
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="w-full relative px-6 py-20 md:py-32 overflow-hidden bg-slate-950">
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Hero */}
            <div className="text-center max-w-4xl mx-auto mb-24">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-semibold mb-6">
                    <Building2 className="w-4 h-4" /> Customer Stories
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-8 leading-tight"
                >
                    See how top hospitality groups are scaling.
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
                >
                    From independent bistros to multinational enterprise chains, the fastest-growing brands run their entire operation on Resevit.
                </motion.p>
            </div>

            {/* Content List */}
            {isLoading ? (
                <div className="space-y-8">
                    <div className="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl h-[300px] w-full"></div>
                    <div className="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl h-[300px] w-full"></div>
                </div>
            ) : stories.length > 0 ? (
                <div className="space-y-12">
                    {stories.map((story, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            key={story.id}
                            className="group flex flex-col lg:flex-row bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden hover:bg-slate-800/50 transition-colors"
                        >
                            {/* Left: Client Info */}
                            <div className="lg:w-1/3 p-10 md:p-12 bg-slate-900/80 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-center">
                                {story.logo_url ? (
                                    <img src={story.logo_url} alt={story.client_name} className="h-12 w-auto mb-8 object-contain" />
                                ) : (
                                    <div className="h-12 w-12 rounded bg-slate-800 mb-8 flex items-center justify-center font-bold text-slate-500 text-xl">
                                        {story.client_name.charAt(0)}
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-white mb-2">{story.client_name}</h3>
                                <p className="text-slate-400 mb-8">Moved to Resevit to unify their 12 locations and replace 4 legacy systems.</p>
                                
                                {story.metrics && (
                                    <div className="space-y-4">
                                        {Object.entries(story.metrics).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between border-t border-slate-800 pt-4">
                                                <span className="text-sm font-medium text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-lg font-black text-amber-500 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: The Story snippet */}
                            <div className="lg:w-2/3 p-10 md:p-16 flex flex-col justify-center relative">
                                <Quote className="w-24 h-24 absolute top-8 right-8 text-slate-800 opacity-20 pointer-events-none" />
                                <div className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed mb-10 italic relative z-10">
                                    "{story.content.substring(0, 250)}..."
                                </div>
                                <div>
                                    <Link to={`/customers/${story.slug}`} className="inline-flex items-center gap-3 px-6 py-3 bg-white text-slate-950 font-bold rounded-full hover:bg-slate-200 transition-colors">
                                        Read the full case study <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div variants={fadeIn} className="bg-slate-900 border border-slate-800 border-dashed rounded-[3rem] p-16 md:p-24 text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
                        <Star className="w-10 h-10 text-amber-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Case studies coming soon.</h3>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">We are currently compiling metrics and interviews from our top enterprise clients. Check back in a few days to see how the industry is leveraging our OS.</p>
                </motion.div>
            )}
        </div>
    </div>
  );
}
