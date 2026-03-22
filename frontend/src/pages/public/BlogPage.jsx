import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/centralApi';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get('/public/blogs');
        setPosts(response.data || []);
      } catch (error) {
        console.error("Failed to load blogs", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="w-full relative px-6 py-20 md:py-32 overflow-hidden bg-slate-950">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Hero */}
            <div className="max-w-3xl mb-24">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
                    <BookOpen className="w-4 h-4" /> Resevit Engineering & Culture
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6"
                >
                    The latest from our team.
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-400 leading-relaxed"
                >
                    Engineering deep dives, hospitality trends, and major platform updates direct from the builders of Resevit.
                </motion.p>
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse bg-slate-900 border border-slate-800 rounded-3xl h-[400px] flex flex-col overflow-hidden">
                            <div className="h-48 bg-slate-800"></div>
                            <div className="p-6 space-y-4">
                                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                                <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-800 rounded w-full"></div>
                                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <motion.div 
                    initial="initial" animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {posts.map((post) => (
                        <motion.article 
                            key={post.id} variants={fadeIn}
                            className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col"
                        >
                            <div className="h-48 bg-slate-800 relative overflow-hidden">
                                {post.image_url ? (
                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-slate-800 flex items-center justify-center">
                                        <BookOpen className="w-12 h-12 text-slate-700" />
                                    </div>
                                )}
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-4">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(post.published_at || post.created_at)}</span>
                                    {post.author && <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {post.author}</span>}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{post.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                                    {post.excerpt || post.content.substring(0, 150) + '...'}
                                </p>
                                <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300">
                                    Read Article <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            ) : (
                <motion.div variants={fadeIn} className="bg-slate-900 border border-slate-800 border-dashed rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No posts available yet</h3>
                    <p className="text-slate-400 max-w-md mx-auto">We are preparing some incredible insights for you. Check back soon for deep dives into our engineering and product culture.</p>
                </motion.div>
            )}
        </div>
    </div>
  );
}
