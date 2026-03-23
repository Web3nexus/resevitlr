import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'
import api from '../services/api'

export function MenuView() {
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  
  const [showItemModal, setShowItemModal] = useState(false)
  const [newItem, setNewItem] = useState({ 
    menu_category_id: '', name: '', description: '', price: '0.00', is_available: true 
  })

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu');
      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setError('Could not load menu data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu/categories', newCategory);
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      fetchMenuData();
    } catch (err) {
      console.error('Failed to add category', err);
      alert('Failed to add category');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      if (!newItem.menu_category_id) {
        alert('Please select a category first. If none exist, create one.');
        return;
      }
      await api.post('/menu/items', newItem);
      setShowItemModal(false);
      setNewItem({ menu_category_id: '', name: '', description: '', price: '0.00', is_available: true });
      fetchMenuData(); // Refresh the overarching data
    } catch (err) {
      console.error('Failed to add item', err);
      alert('Failed to add item');
    }
  };

  // Flatten items for the 'Items' tab
  const allItems = (Array.isArray(categories) ? categories : []).flatMap(cat => 
    (Array.isArray(cat.items) ? cat.items : []).map(item => ({ ...item, category_name: cat.name }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Menu Builder</h2>
          <p className="text-slate-500 text-sm">Organize your restaurant offerings and pricing.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-700 font-semibold shadow-sm hover:bg-slate-50 transition-all">
             <Filter size={16} /> Filter
           </button>
           <button 
             onClick={() => activeTab === 'categories' ? setShowCategoryModal(true) : setShowItemModal(true)}
             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all"
           >
             <Plus size={18} /> {activeTab === 'categories' ? 'Add Category' : 'Add Item'}
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
           <button 
             onClick={() => setActiveTab('categories')}
             className={`px-6 py-4 font-semibold text-sm transition-all border-b-2 ${activeTab === 'categories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             Categories
           </button>
           <button 
             onClick={() => setActiveTab('items')}
             className={`px-6 py-4 font-semibold text-sm transition-all border-b-2 ${activeTab === 'items' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             Items
           </button>
        </div>

        <div className="p-6">
           <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
                <p className="font-medium">Synchronizing with Kitchen...</p>
             </div>
           ) : error ? (
             <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-bold mb-2">{error}</p>
                <button onClick={fetchMenuData} className="text-blue-600 font-bold underline">Retry Connection</button>
             </div>
           ) : activeTab === 'categories' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(categories) && categories.length > 0 ? categories.map(cat => (
                  <div key={cat.id} className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-blue-600">
                        <ImageIcon size={24} />
                      </div>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                         <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{cat.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">{cat.items?.length || 0} Items</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {cat.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                     <p>No categories found. Start by adding your first menu category.</p>
                  </div>
                )}
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Item Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Price</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {Array.isArray(allItems) && allItems.length > 0 ? allItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{item.name}</div>
                              <div className="text-xs text-slate-400 truncate max-w-xs">{item.description}</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-tight">
                                {item.category_name}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right font-black text-slate-900">${item.price}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_available !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {item.is_available !== false ? 'Available' : 'Out of Stock'}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><MoreVertical size={16} /></button>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                           <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                             No items found. Go to Categories to add some delicious dishes!
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-bold text-lg mb-4">New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                    <input required type="text" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" placeholder="e.g. Starters" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Description (Optional)</label>
                    <textarea value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" rows="2"></textarea>
                 </div>
                 <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Create Category</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
              <h3 className="font-bold text-lg mb-4">New Menu Item</h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Item Name</label>
                        <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                        <select required value={newItem.menu_category_id} onChange={e => setNewItem({...newItem, menu_category_id: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none">
                           <option value="">Select Category</option>
                           {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                    <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" rows="2"></textarea>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Price ($)</label>
                        <input required type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none" />
                     </div>
                 </div>
                 <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Create Item</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
