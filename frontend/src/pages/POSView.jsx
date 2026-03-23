import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, Table as TableIcon, CreditCard, Trash2, Plus, Minus, User, Loader2, CheckCircle } from 'lucide-react'
import api from '../services/api'

export function POSView() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [tables, setTables] = useState([])
  const [cart, setCart] = useState([])
  const [selectedTable, setSelectedTable] = useState('')
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPOSData();
  }, []);

  const fetchPOSData = async () => {
    setLoading(true);
    try {
      const [menuRes, tablesRes] = await Promise.all([
        api.get('/menu'),
        api.get('/tables')
      ]);
      
      setCategories(menuRes.data);
      const flattenedItems = (Array.isArray(menuRes.data) ? menuRes.data : []).flatMap(cat => 
        (Array.isArray(cat.items) ? cat.items : []).map(item => ({ ...item, category_name: cat.name }))
      );
      setItems(flattenedItems);
      setTables(tablesRes.data);
      if (tablesRes.data.length > 0) setSelectedTable(tablesRes.data[0].id);
    } catch (err) {
      console.error('POS Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id)
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id))
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    try {
      const payload = {
        restaurant_table_id: selectedTable,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      };
      
      const response = await api.post('/orders', payload);
      setOrderSuccess(response.data);
      setCart([]);
      
      setTimeout(() => setOrderSuccess(null), 3000);
    } catch (err) {
      console.error('Checkout Failed:', err);
      alert('Transaction failed. Check kitchen connection.');
    } finally {
      setCheckingOut(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
         <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
         <p className="font-bold uppercase tracking-widest text-xs">Initializing POS Terminal...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      {/* Item Selection */}
      <div className="flex-1 flex flex-col gap-6">
         <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm px-4">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Quick search menu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 py-2 focus:outline-none text-slate-700 font-medium"
            />
         </div>

         <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            {(Array.isArray(filteredItems) ? filteredItems : []).map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-lg transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div>
                  <div className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-tighter opacity-70">{item.category_name}</div>
                  <div className="font-bold text-slate-800 line-clamp-2 leading-tight">{item.name}</div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-black text-slate-900">${parseFloat(item.price).toFixed(2)}</div>
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
         </div>
      </div>

      {/* Cart / Checkout */}
      <div className="w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden relative">
         {orderSuccess && (
           <div className="absolute inset-0 bg-blue-600 z-50 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
              <CheckCircle size={64} className="mb-4" />
              <h2 className="text-2xl font-black">Order Placed!</h2>
              <p className="opacity-80">Order #{orderSuccess.id} sent to kitchen.</p>
           </div>
         )}

         <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <h3 className="font-black text-slate-800 tracking-tighter text-lg uppercase">POS Terminal</h3>
            </div>
            <select 
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs border-transparent focus:ring-0 cursor-pointer"
            >
              {(Array.isArray(tables) ? tables : []).map(t => (
                <option key={t.id} value={t.id}>Table {t.table_number}</option>
              ))}
            </select>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="font-black text-xs uppercase tracking-widest">No Items in session</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between group animate-in slide-in-from-right-2 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-600 font-black text-white flex items-center justify-center text-xs shadow-md shadow-blue-500/20">
                      {item.quantity}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">${parseFloat(item.price).toFixed(2)} unit</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-black text-slate-900 text-sm">${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
         </div>

         <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Subtotal</span>
                <span className="text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Service Tax (10%)</span>
                <span className="text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 mt-4 shadow-sm">
                <span className="text-slate-800 font-black text-xs uppercase tracking-widest">Grand Total</span>
                <span className="text-blue-600 font-black text-3xl tracking-tighter">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <button className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-slate-200 text-slate-600 font-black hover:bg-white hover:border-slate-300 transition-all text-xs uppercase tracking-widest shadow-sm">
                 Receipt
               </button>
               <button 
                 onClick={handleCheckout}
                 disabled={cart.length === 0 || checkingOut}
                 className={`flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 transition-all text-xs uppercase tracking-widest group active:scale-95 ${
                   (cart.length === 0 || checkingOut) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                 }`}
               >
                 {checkingOut ? (
                    <div className="flex items-center gap-2">
                       <Loader2 size={18} className="animate-spin" />
                       <span>Processing Stripe...</span>
                    </div>
                 ) : (
                    <>
                       <CreditCard size={18} />
                       <span>Checkout</span>
                    </>
                 )}
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}
