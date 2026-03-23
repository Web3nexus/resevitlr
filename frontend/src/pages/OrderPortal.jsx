import React, { useState, useEffect } from 'react'
import { ShoppingBag, Star, ChevronRight, Clock, MapPin, Search, Plus, Minus, Loader2 } from 'lucide-react'
import api from '../services/api'

export function OrderPortal() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      const categoriesData = res.data || [];
      const flattenedItems = (Array.isArray(categoriesData) ? categoriesData : []).flatMap(cat => 
        (Array.isArray(cat.items) ? cat.items : []).map(item => ({ ...item, category_name: cat.name }))
      );
      setCategories(['All', ...(Array.isArray(categoriesData) ? categoriesData : []).map(c => c.name)]);
      setItems(flattenedItems);
    } catch (err) {
      console.error('Menu Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.qty), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      await api.post('/orders', {
        customer_name: 'Online Guest',
        total_amount: cartTotal,
        status: 'pending',
        items: cart.map(i => ({ menu_item_id: i.id, quantity: i.qty, price: i.price }))
      });
      setOrderComplete(true);
      setCart([]);
      setTimeout(() => {
        setOrderComplete(false);
        setShowCart(false);
      }, 3000);
    } catch (err) {
      console.error('Checkout Failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter(item => {
    if (activeCategory === 'All') return true;
    return item.category_name === activeCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
         <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
         <h1 className="text-xl font-black text-slate-900 tracking-tighter">PREPARING MENU...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 animate-in fade-in duration-700 relative">
      {/* Customer Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm shadow-slate-900/2">
         <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
                  <ShoppingBag size={22} />
               </div>
               <span className="font-black tracking-tighter text-2xl uppercase italic">RESEVIT <span className="text-blue-600">HUB</span></span>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden lg:flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                  <MapPin size={16} className="text-blue-600" /> Kitchen: Downtown NY
               </div>
               <button 
                onClick={() => setShowCart(true)}
                className="relative bg-slate-900 text-white p-3 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
               >
                  <ShoppingBag size={18} /> Order Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center border-2 border-white font-black animate-bounce">
                       {cartCount}
                    </span>
                  )}
               </button>
            </div>
         </div>
      </header>

      {/* Cart Drawer Overlay */}
      {showCart && (
         <div className="fixed inset-0 z-100 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCart(false)}></div>
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Checkout Basket</h2>
                  <button onClick={() => setShowCart(false)} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                     <Plus size={20} className="rotate-45" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {orderComplete ? (
                     <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
                        <div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                           <Star size={40} fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Order Logged!</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your meal is being prepared by our chefs.</p>
                     </div>
                  ) : cart.length > 0 ? cart.map(item => (
                     <div key={item.id} className="flex items-center gap-4 group">
                        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 group-hover:border-blue-200 transition-colors">
                           <ShoppingBag size={24} />
                        </div>
                        <div className="flex-1">
                           <div className="font-black text-slate-900 uppercase tracking-tight text-sm">{item.name}</div>
                           <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">${parseFloat(item.price).toFixed(2)} × {item.qty}</div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                              <Minus size={16} />
                           </button>
                           <div className="font-black text-slate-900 text-sm">{item.qty}</div>
                           <button onClick={() => addToCart(item)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                              <Plus size={16} />
                           </button>
                        </div>
                     </div>
                  )) : (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <ShoppingBag size={64} strokeWidth={1} className="mb-4" />
                        <p className="font-black text-[10px] uppercase tracking-widest">Basket is currently empty</p>
                     </div>
                  )}
               </div>

               {cart.length > 0 && !orderComplete && (
                  <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50/50">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Total</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">${cartTotal.toFixed(2)}</span>
                     </div>
                     <button 
                        onClick={handleCheckout}
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                     >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
                        Confirm Order
                     </button>
                  </div>
               )}
            </div>
         </div>
      )}

      {/* Hero / Info */}
      <section className="bg-white px-4 py-12 border-b border-slate-100 relative overflow-hidden">
         <div className="absolute -right-20 -top-20 h-64 w-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
         <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Open Now</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-4 text-slate-900">Bistrologix Kitchen</h1>
            <div className="flex flex-wrap items-center gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-2 text-amber-500">
                  <Star size={18} fill="currentColor" /> <span className="text-slate-900">4.8 (500+)</span>
               </div>
               <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" /> <span className="text-slate-900">20-35 min</span>
               </div>
               <div className="text-blue-600">
                  Priority Delivery
               </div>
            </div>
            
            <div className="mt-10 relative max-w-2xl group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
               <input 
                 type="text" 
                 placeholder="Search flavors, dishes, cravings..." 
                 className="w-full pl-14 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-3xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-700 shadow-inner"
               />
            </div>
         </div>
      </section>

      {/* Menu Sections */}
      <main className="max-w-5xl mx-auto px-4 py-12">
         <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide py-2">
            {(Array.isArray(categories) ? categories : []).map((cat) => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat)}
                 className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                    activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 border-blue-600 scale-105' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'
                 }`}
               >
                  {cat}
               </button>
            ))}
         </div>

         <div className="mt-6">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 uppercase tracking-tight">
               Discover {activeCategory === 'All' ? 'Popular' : activeCategory} 
               <ChevronRight size={24} className="text-blue-200" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
               {Array.isArray(filteredItems) && filteredItems.length > 0 ? filteredItems.map(item => (
                 <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex justify-between items-center group cursor-pointer active:scale-95 relative overflow-hidden">
                    <div className="flex-1 pr-6">
                       <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none">{item.name}</h3>
                       <p className="text-xs text-slate-400 font-bold mb-4 line-clamp-2 uppercase tracking-tight opacity-70 italic">{item.description || 'Signature kitchen special prepared fresh daily.'}</p>
                       <div className="font-black text-blue-600 text-xl tracking-tighter">${parseFloat(item.price).toFixed(2)}</div>
                    </div>
                    <div className="relative">
                       <div className="h-28 w-28 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 border-2 border-slate-50 group-hover:border-blue-50 transition-colors">
                          <ShoppingBag size={40} strokeWidth={1} />
                       </div>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           addToCart(item);
                         }}
                         className="absolute -bottom-3 -right-3 bg-slate-900 text-white h-12 w-12 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 active:rotate-12 transition-all group-hover:bg-blue-600"
                       >
                          <Plus size={24} strokeWidth={3} />
                       </button>
                    </div>
                 </div>
               )) : (
                  <div className="col-span-full py-20 text-center">
                     <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">Our chefs are preparing this section...</p>
                  </div>
               )}
            </div>
         </div>
      </main>
    </div>
  )
}
