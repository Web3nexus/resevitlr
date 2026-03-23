import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Globe, Save, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function TranslationManagementView() {
  const [translations, setTranslations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [newTranslation, setNewTranslation] = useState({
    locale: 'en',
    group: '',
    key: '',
    value: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] = useState(null);

  const locales = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' }
  ];

  const fetchTranslations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/saas/translations', {
        params: { locale: selectedLocale }
      });
      setTranslations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch translations", error);
      setError("Failed to load translations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, [selectedLocale]);

  const handleCreateTranslation = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await api.post('/saas/translations', newTranslation);
      setIsModalOpen(false);
      setNewTranslation({ locale: selectedLocale, group: '', key: '', value: '' });
      fetchTranslations();
    } catch (error) {
      setError("Failed to create translation. Ensure the key doesn't already exist in this group/locale.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTranslation = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await api.put(`/saas/translations/${editingTranslation.id}`, {
        value: editingTranslation.value
      });
      setEditingTranslation(null);
      fetchTranslations();
    } catch (error) {
      setError("Failed to update translation.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTranslation = async (id) => {
    try {
      await api.delete(`/saas/translations/${id}`);
      fetchTranslations();
    } catch (error) {
      console.error("Failed to delete translation", error);
      alert("Failed to delete translation.");
    }
  };

  const confirmDelete = (id) => {
    setTranslationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const filteredTranslations = translations.filter(t => 
    t.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Translations</h1>
          <p className="text-slate-400 text-sm mt-1">Manage dynamic content and localization keys.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Translation
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by key, value, or group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Locale:</span>
            <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1">
              {locales.map(l => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLocale(l.code)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedLocale === l.code 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium w-1/4">Group / Key</th>
              <th className="p-4 font-medium">Value ({selectedLocale.toUpperCase()})</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="3" className="p-12 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                  <p className="font-medium">Loading translations...</p>
                </td>
              </tr>
            ) : filteredTranslations.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-12 text-center text-slate-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-10" />
                  <p className="font-medium">No translations found for this search or locale.</p>
                </td>
              </tr>
             ) : (
              filteredTranslations.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 align-top">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{t.group}</span>
                      <span className="text-white font-mono text-xs">{t.key}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{t.value}</p>
                  </td>
                  <td className="p-4 text-right align-top">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingTranslation({...t})}
                          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors" title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(t.id)}
                          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors" title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Add New Translation Key</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTranslation} className="space-y-6">
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Locale</label>
                      <select 
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newTranslation.locale}
                        onChange={e => setNewTranslation({...newTranslation, locale: e.target.value})}
                      >
                        {locales.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Group (Category)</label>
                      <input 
                        required
                        placeholder="e.g. auth, common"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newTranslation.group}
                        onChange={e => setNewTranslation({...newTranslation, group: e.target.value.toLowerCase()})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Key Name</label>
                    <input 
                      required
                      placeholder="e.g. login_title, welcome_message"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTranslation.key}
                      onChange={e => setNewTranslation({...newTranslation, key: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Content (Value)</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Enter the translated content..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      value={newTranslation.value}
                      onChange={e => setNewTranslation({...newTranslation, value: e.target.value})}
                    />
                  </div>
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Translation
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTranslation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingTranslation(null)} />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Translation</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-widest">{editingTranslation.group} / {editingTranslation.key}</p>
              </div>
              <button onClick={() => setEditingTranslation(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateTranslation} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Content ({editingTranslation.locale.toUpperCase()})</label>
                <textarea 
                  required
                  autoFocus
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={editingTranslation.value}
                  onChange={e => setEditingTranslation({...editingTranslation, value: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTranslation(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteTranslation(translationToDelete)}
        title="Delete Translation Key?"
        message="This will permanently delete this translation key for the selected locale. If this key is used in the frontend, it will show the raw key name instead of the translated value."
        confirmText="Delete Key"
        type="danger"
      />
    </div>
  );
}
