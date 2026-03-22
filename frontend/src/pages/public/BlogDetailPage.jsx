import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Share2, Tag, Loader2 } from 'lucide-react';
import centralApi from '../../services/centralApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogDetailPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await centralApi.get(`/public/blogs`);
                const found = res.data.find(p => p.slug === slug);
                setPost(found);
            } catch (error) {
                console.error('Failed to fetch blog post', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Fetching Story...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-white mb-4">Post not found.</h1>
                <p className="text-slate-400 mb-8 max-w-md">The article you are looking for might have been moved or unpublished by our editorial team.</p>
                <Link to="/blog" className="px-8 py-4 bg-white text-slate-950 font-bold rounded-full hover:bg-slate-200 transition-all">
                    Return to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-32">
            <div className="max-w-4xl mx-auto px-6">
                
                {/* Navigation & Header */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold mb-10">
                        <ArrowLeft size={18} /> Back to Blog
                    </Link>
                    
                    <div className="flex items-center gap-4 text-xs font-black text-blue-400 uppercase tracking-widest mb-6 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
                        {post.author || 'Engineering'} • {new Date(post.published_at || post.created_at).toLocaleDateString()}
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-8">
                        {post.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-8 border-y border-slate-800 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <User size={20} className="text-slate-500" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white uppercase tracking-tight">{post.author || 'Resevit Staff'}</div>
                                <div className="text-xs text-slate-500">Core Contributor</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Featured Image */}
                {post.image_url && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full aspect-video rounded-[2.5rem] overflow-hidden mb-20 border border-slate-800 shadow-4xl"
                    >
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    </motion.div>
                )}

                {/* Content */}
                <motion.article 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="prose prose-invert prose-blue max-w-none markdown-body"
                >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </motion.article>

                {/* Footer Section */}
                <div className="mt-32 pt-16 border-t border-slate-800">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-12 rounded-[3.5rem] text-center">
                        <h3 className="text-3xl font-black text-white mb-4 italic tracking-tight underline decoration-blue-500 underline-offset-8">Enjoyed this build log?</h3>
                        <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto font-medium leading-relaxed">Join 20k+ operators getting our weekly deep-dive into the future of restaurant technology.</p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-lg mx-auto">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-blue-500 font-bold"
                            />
                            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all shrink-0">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reusing existing Markdown styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .markdown-body h1 { display: none; }
                .markdown-body h2 { font-size: 2rem; font-weight: 800; margin-top: 3rem; margin-bottom: 1.5rem; color: white; border-bottom: 2px solid #1e293b; padding-bottom: 0.5rem; }
                .markdown-body h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; color: #60a5fa; }
                .markdown-body p { margin-bottom: 2rem; line-height: 2; color: #94a3b8; font-size: 1.25rem; font-weight: 400; }
                .markdown-body ul { margin-bottom: 2rem; padding-left: 2rem; list-style-type: square; color: #cbd5e1; font-size: 1.15rem; }
                .markdown-body li { margin-bottom: 0.75rem; }
                .markdown-body strong { color: white; }
                .markdown-body pre { background: #000; padding: 2rem; border-radius: 1.5rem; border: 1px solid #1e293b; overflow-x: auto; margin: 3rem 0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .markdown-body blockquote { border-left: 6px solid #3b82f6; background: #000; padding: 2.5rem; border-radius: 0 2rem 2rem 0; font-size: 1.5rem; line-height: 1.6; font-style: italic; color: #60a5fa; margin: 3rem 0; }
            `}} />
        </div>
    );
}
