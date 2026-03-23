import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Globe, FileText, Star, BookOpen, X, CheckCircle, AlertTriangle, Home, Save, RefreshCw } from 'lucide-react';
import centralApi from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// ─── Landing Page Settings Panel ─────────────────────────────────────
function LandingPageEditor() {
    const [form, setForm] = useState({
        landing_badge_text: '',
        landing_hero_title: '',
        landing_hero_subtitle: '',
        landing_cta_primary: '',
        landing_cta_secondary: '',
        landing_trial_tagline: '',
        landing_hero_image_url: '',
        landing_social_proof_label: '',
        landing_social_proof_brands: '',
        landing_feature1_title: '',
        landing_feature1_subtitle: '',
        landing_feature1_bullets: '',
        landing_feature2_title: '',
        landing_feature2_subtitle: '',
        landing_feature2_bullets: '',
        landing_bento_heading: '',
        landing_bento_subheading: '',
        landing_bento_items: '',
        landing_cta_section_title: '',
        landing_cta_section_body: '',
        landing_cta_section_button: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        centralApi.get('/saas/settings').then(res => {
            setForm(prev => ({ ...prev, ...res.data }));
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await centralApi.post('/saas/settings', form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            alert('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const field = (label, key, help = '', multiline = false) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
            {multiline ? (
                <textarea
                    value={form[key] || ''}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm min-h-[90px] font-mono"
                    placeholder={help}
                />
            ) : (
                <input
                    type="text"
                    value={form[key] || ''}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    placeholder={help}
                />
            )}
        </div>
    );

    if (isLoading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading landing page settings...</div>;

    return (
        <div className="space-y-10 p-6">
            {/* Hero */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                    Hero Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {field('Badge Text (top pill)', 'landing_badge_text', 'e.g. Now serving restaurants in 30+ cities')}
                    {field('Primary CTA Button', 'landing_cta_primary', 'e.g. Start Free Trial')}
                    {field('Secondary CTA Button', 'landing_cta_secondary', 'e.g. Explore Features')}
                    {field('Tagline below buttons', 'landing_trial_tagline', 'e.g. No credit card required • 14-day free trial')}
                </div>
                {field('Hero Title', 'landing_hero_title', 'e.g. The Intelligent Guest Retention Platform')}
                {field('Hero Subtitle', 'landing_hero_subtitle', 'One line that sells your product...', true)}
                {field('Hero Preview Image URL', 'landing_hero_image_url', 'Paste a screenshot/image URL to show in the hero mockup box (leave blank for abstract placeholder)')}
                <p className="text-xs text-slate-500 -mt-1">💡 Upload your dashboard screenshot to any image host (e.g. <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">imgbb.com</a>) and paste the direct URL here.</p>
            </div>

            {/* Social Proof */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    Social Proof Strip
                </h3>
                {field('Label Text', 'landing_social_proof_label', 'e.g. Trusted by scaling hospitality brands')}
                {field('Brand Names (comma separated)', 'landing_social_proof_brands', 'e.g. The Grill House, Bistro Uno, Saveur, Urban Plates, Coast')}
            </div>

            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                    Feature Section 1
                </h3>
                {field('Feature Title', 'landing_feature1_title', 'e.g. Effortless Reservations')}
                {field('Feature Description', 'landing_feature1_subtitle', 'Short paragraph...', true)}
                {field('Bullet Points (one per line)', 'landing_feature1_bullets', 'Online booking widgets\nSmart table management\nWaitlist & SMS alerts', true)}
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                    Feature Section 2
                </h3>
                {field('Feature Title', 'landing_feature2_title', 'e.g. Smart Guest Intelligence')}
                {field('Feature Description', 'landing_feature2_subtitle', 'Short paragraph...', true)}
                {field('Bullet Points (one per line)', 'landing_feature2_bullets', 'Guest preference tracking\nAutomated follow-ups\nLoyalty & repeat booking', true)}
            </div>

            {/* Bento Grid */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                    Features Grid Section
                </h3>
                {field('Section Heading', 'landing_bento_heading', 'e.g. Everything you need to grow')}
                {field('Section Subheading', 'landing_bento_subheading', 'e.g. Built for restaurant operators, not IT teams.')}
                {field('Feature tiles (one per line: "Title | description")', 'landing_bento_items', 'Smart Reservations | Accept bookings 24/7\nTable Management | Visual floor plan control\nGuest Profiles | Know your regulars\nMarketing Tools | Email & SMS campaigns', true)}
            </div>

            {/* Bottom CTA */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                    Final CTA Section
                </h3>
                {field('CTA Heading', 'landing_cta_section_title', 'e.g. Ready to grow your restaurant?')}
                {field('CTA Body Text', 'landing_cta_section_body', 'e.g. Join hundreds of restaurants using Resevit. Setup in 5 minutes.', true)}
                {field('CTA Button Text', 'landing_cta_section_button', 'e.g. Start your 14-day free trial')}
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${saved ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}`}
                >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Landing Page'}
                </button>
            </div>
        </div>
    );
}

// ─── Main CMS View ─────────────────────────────────────────────────────
export default function SaaSCMSView() {
    const [activeTab, setActiveTab] = useState('landing');
    const [data, setData] = useState({ blogs: [], stories: [], docs: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (activeTab !== 'landing') fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [blogsRes, storiesRes, docsRes] = await Promise.all([
                centralApi.get('/saas/cms/blogs'),
                centralApi.get('/saas/cms/stories'),
                centralApi.get('/saas/cms/docs')
            ]);
            setData({ blogs: blogsRes.data, stories: storiesRes.data, docs: docsRes.data });
        } catch (error) {
            console.error('Failed to load CMS data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            if (activeTab === 'stories' && item.metrics) {
                setFormData({ ...item, metrics: JSON.stringify(item.metrics, null, 2) });
            } else {
                setFormData(item);
            }
        } else {
            if (activeTab === 'blogs') {
                setFormData({ title: '', slug: '', excerpt: '', content: '', author: '', is_published: true });
            } else if (activeTab === 'stories') {
                setFormData({ client_name: '', slug: '', metrics: '{\n  "key": "value"\n}', content: '', is_published: true });
            } else if (activeTab === 'docs') {
                setFormData({ title: '', slug: '', category: 'Core Concepts', order_index: 0, content: '', is_published: true });
            }
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...formData };
            if (activeTab === 'stories' && submitData.metrics) {
                try { submitData.metrics = JSON.parse(submitData.metrics); }
                catch (e) { alert('Invalid JSON in metrics'); return; }
            }
            if (editingItem) {
                await centralApi.put(`/saas/cms/${activeTab}/${editingItem.id}`, submitData);
            } else {
                await centralApi.post(`/saas/cms/${activeTab}`, submitData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Failed to save. Check unique slugs or missing fields.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await centralApi.delete(`/saas/cms/${activeTab}/${id}`);
            fetchData();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const confirmDelete = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const tabs = [
        { id: 'landing', label: 'Landing Page', icon: Home },
        { id: 'blogs', label: 'Resevit Insights', icon: Globe, count: data.blogs.length },
        { id: 'stories', label: 'Success Stories', icon: Star, count: data.stories.length },
        { id: 'docs', label: 'Product Manuals', icon: BookOpen, count: data.docs.length },
    ];

    const currentData = data[activeTab] || [];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-[#0d1117] p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Content Management</h1>
                    <p className="text-slate-400 max-w-2xl">Manage everything visible on your public website — from the landing page hero down to every blog post and guide.</p>
                </div>
                {activeTab !== 'landing' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="relative z-10 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Entry
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2 p-1 bg-[#0d1117] rounded-2xl border border-slate-800 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                            activeTab === tab.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                {activeTab === 'landing' ? (
                    <LandingPageEditor />
                ) : isLoading ? (
                    <div className="p-12 text-center text-slate-500 animate-pulse font-mono text-sm">LOADING CMS PIPELINE...</div>
                ) : currentData.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <FileText className="w-16 h-16 text-slate-800 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No {activeTab} defined yet</h3>
                        <p className="text-slate-500 text-sm">Click "New Entry" to publish your first post.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs uppercase bg-slate-900/80 text-slate-500 border-b border-slate-800 tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Entry Details</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {currentData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-white text-base mb-1">
                                            {item.title || item.client_name}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">/{item.slug}</code>
                                            {item.category && <span className="text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full">{item.category}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {item.is_published ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Live
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Draft</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                             <button onClick={() => confirmDelete(item.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-20"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{editingItem ? 'Edit Content' : 'Create New Content'}</h2>
                                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mt-1">Drafting for {activeTab}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1">
                                <form id="cms-form" onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{activeTab === 'stories' ? 'Client Name' : 'Primary Title'}</label>
                                            <input
                                                required type="text"
                                                value={formData.title || formData.client_name || ''}
                                                onChange={e => setFormData({...formData, [activeTab === 'stories' ? 'client_name' : 'title']: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">URL Slug <AlertTriangle className="w-3 h-3 text-amber-500" /></label>
                                            <input
                                                required type="text"
                                                value={formData.slug || ''}
                                                onChange={e => setFormData({...formData, slug: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    {activeTab === 'docs' && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group Category</label>
                                                <input required type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-medium" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Index (Sort)</label>
                                                <input type="number" value={formData.order_index || 0} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-medium" />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'blogs' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Short Excerpt</label>
                                            <textarea value={formData.excerpt || ''} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 min-h-[80px]" />
                                        </div>
                                    )}

                                    {activeTab === 'stories' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">JSON Metrics</label>
                                            <textarea value={formData.metrics || ''} onChange={e => setFormData({...formData, metrics: e.target.value})} className="w-full bg-[#0d1117] border border-slate-800 rounded-xl px-4 py-3 text-blue-300 focus:outline-none focus:border-blue-500 min-h-[120px] font-mono text-xs" />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Content (Markdown)</label>
                                        <textarea
                                            required
                                            value={formData.content || ''}
                                            onChange={e => setFormData({...formData, content: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all min-h-[300px] font-mono text-sm leading-relaxed shadow-inner"
                                            placeholder="# Start writing markdown here..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                                        <input
                                            type="checkbox" id="publish"
                                            checked={formData.is_published}
                                            onChange={e => setFormData({...formData, is_published: e.target.checked})}
                                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                        />
                                        <label htmlFor="publish" className="text-sm font-bold text-white cursor-pointer select-none">
                                            Publish immediately (visible on public site)
                                        </label>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" form="cms-form" className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                                    <CheckCircle className="w-5 h-5" />
                                    Save & Publish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => handleDelete(itemToDelete)}
                title={`Delete ${activeTab === 'blogs' ? 'Blog' : activeTab === 'stories' ? 'Story' : 'Doc'}?`}
                message="This will permanently remove this content from your public website. This action cannot be undone."
                confirmText="Delete Permanently"
                type="danger"
            />
        </div>
    );
}
