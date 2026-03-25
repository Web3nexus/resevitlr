import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Save, FileText, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const DEFAULT_TEMPLATES = [
  { slug: '2fa_code', subject: 'Your Security Code', variables: ['code', 'name'] },
  { slug: 'welcome_email', subject: 'Welcome to {platform_name}!', variables: ['name', 'business_name', 'login_url'] },
  { slug: 'password_reset', subject: 'Reset Your Password', variables: ['name', 'reset_url'] }
];

export default function EmailManagementView() {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('saas/email-templates');
      setTemplates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (template) => {
    setIsSaving(true);
    try {
      await api.post('saas/email-templates', template);
      fetchTemplates();
      setEditingTemplate(null);
    } catch (error) {
      alert("Error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/saas/email-templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      alert("Error deleting template.");
    }
  };

  const confirmDelete = (id) => {
    setTemplateToDelete(id);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading templates...</div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Email Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Manage system-wide email templates and automated communications.</p>
        </div>
        <button 
          onClick={() => setEditingTemplate({ slug: '', subject: '', content: '', variables: [] })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(templates) && templates.map(template => (
          <div key={template.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold">{template.subject}</h4>
                  <p className="text-slate-500 text-xs font-mono">{template.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingTemplate(template)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => confirmDelete(template.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-3 mb-4">
               <p className="text-xs text-slate-400 line-clamp-3 whitespace-pre-wrap font-serif italic">
                {template.content}
               </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Array.isArray(template.variables) ? template.variables : []).map(v => (
                <span key={v} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono">
                  {'{'}{v}{'}'}
                </span>
              ))}
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="md:col-span-2 py-12 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-3xl">
            <div className="w-12 h-12 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">No custom templates found. System is using internal defaults.</p>
            <button 
               onClick={() => setEditingTemplate({ slug: '', subject: '', content: '', variables: [] })}
               className="mt-4 text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-widest"
            >
              Create your first template
            </button>
          </div>
        )}
      </div>

      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTemplate.id ? 'Edit' : 'Create'} Email Template
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Editor Mode</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Template Slug</label>
                  <input 
                    value={editingTemplate.slug}
                    onChange={e => setEditingTemplate({...editingTemplate, slug: e.target.value})}
                    placeholder="e.g. welcome_email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Subject Line</label>
                  <input 
                    value={editingTemplate.subject}
                    onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                    placeholder="Hello {name}!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Content (HTML/Text)</label>
                <textarea 
                  value={editingTemplate.content}
                  onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                  rows={10}
                  placeholder="Welcome to our platform..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-4 text-white text-sm font-serif focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Available Variables</label>
                <div className="flex flex-wrap gap-2">
                  {['name', 'code', 'business_name', 'login_url', 'reset_url', 'platform_name'].map(v => (
                    <button 
                      key={v}
                      onClick={() => {
                        const news = (Array.isArray(editingTemplate.variables) && editingTemplate.variables.includes(v))
                          ? editingTemplate.variables.filter(x => x !== v)
                          : [...(Array.isArray(editingTemplate.variables) ? editingTemplate.variables : []), v];
                        setEditingTemplate({...editingTemplate, variables: news});
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                        (Array.isArray(editingTemplate.variables) && editingTemplate.variables.includes(v))
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {'{'}{v}{'}'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
                   <AlertCircle className="w-3 h-3" /> System will auto-replace these before dispatch.
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-slate-800">
               <button 
                onClick={() => setEditingTemplate(null)} 
                className="text-slate-400 hover:text-white px-4 py-2 text-sm font-bold uppercase tracking-widest"
               >
                Cancel
               </button>
               <button 
                onClick={() => handleSave(editingTemplate)}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
               >
                 {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 {isSaving ? 'Deploying...' : 'Save Template'}
               </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(templateToDelete)}
        title="Delete Email Template?"
        message="This will permanently delete the custom template. The system will revert to using hardcoded defaults for this email type."
        confirmText="Delete Template"
        type="danger"
      />
    </div>
  );
}
