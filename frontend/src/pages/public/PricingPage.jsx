import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Building2, Crown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/centralApi';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch public plans, or fallback to dummy ones
    const fetchPlans = async () => {
      try {
        const response = await api.get('/saas/plans');
        // Filter out inactive ones
        const activePlans = (response.data || []).filter(p => p.is_active);
        if (activePlans.length > 0) {
            setPlans(activePlans);
        } else {
            setPlans(defaultPlans);
        }
      } catch (error) {
        setPlans(defaultPlans); // Fallback if endpoint is protected or missing
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const defaultPlans = [
    {
      name: 'Starter',
      slug: 'starter',
      monthly_price: 49,
      yearly_price: 39,
      popular: false,
      features: ['social_integration', 'menu_builder', 'floor_plan']
    },
    {
      name: 'Professional',
      slug: 'professional',
      monthly_price: 99,
      yearly_price: 79,
      popular: true,
      features: ['social_integration', 'pos_terminal', 'menu_builder', 'floor_plan', 'staff_management', 'financial_reports']
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      monthly_price: 199,
      yearly_price: 159,
      popular: false,
      features: ['social_integration', 'pos_terminal', 'menu_builder', 'floor_plan', 'staff_management', 'financial_reports', 'ai_automation', 'online_ordering', 'inventory_tracking']
    }
  ];

  const formatFeature = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPlanIcon = (slug) => {
    if (slug.includes('enterprise')) return <Building2 className="w-5 h-5 text-purple-400" />;
    if (slug.includes('pro')) return <Crown className="w-5 h-5 text-amber-400" />;
    return <Sparkles className="w-5 h-5 text-blue-400" />;
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="w-full relative px-6 py-20 md:py-32 overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6"
                >
                    Simple, transparent pricing
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-slate-400 max-w-2xl mx-auto mb-12"
                >
                    No hidden fees. No unexpected charges. Choose the plan that fits your restaurant's stage of growth.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-full"
                >
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                    >
                        Annually <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] uppercase font-bold tracking-wider">Save 20%</span>
                    </button>
                </motion.div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-pulse flex gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                </div>
            ) : (
                <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center"
                >
                    {plans.map((plan, i) => (
                        <motion.div 
                            key={plan.id || i}
                            variants={fadeIn}
                            className={`relative rounded-3xl p-8 bg-slate-900/50 backdrop-blur-xl border transition-all duration-300 ${
                                plan.popular || (i === 1 && plans.length === 3) 
                                ? 'border-blue-500/50 shadow-2xl shadow-blue-900/20 scale-100 md:scale-105 z-10 bg-linear-to-b from-slate-900 to-slate-950' 
                                : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                        >
                            {(plan.popular || (i === 1 && plans.length === 3)) && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="bg-linear-to-r from-blue-600 to-indigo-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                                    {getPlanIcon(plan.slug)}
                                </div>
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            </div>
                            
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">${billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price}</span>
                                    <span className="text-slate-500 font-medium">/mo</span>
                                </div>
                                {billingCycle === 'yearly' && (
                                    <p className="text-xs text-blue-400 mt-2 font-medium">Billed annually (${plan.yearly_price * 12}/yr)</p>
                                )}
                            </div>

                            <Link 
                                to="/login"
                                className={`w-full py-4 rounded-xl font-bold text-sm transition-all mb-8 flex justify-center items-center gap-2 group ${
                                    plan.popular || (i === 1 && plans.length === 3)
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                }`}
                            >
                                Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="space-y-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-4 mb-4">What's included</p>
                                {plan.features && plan.features.map(feat => (
                                    <div key={feat} className="flex items-start gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-blue-400" />
                                            </div>
                                        </div>
                                        <span className="text-sm text-slate-300 font-medium leading-relaxed">{formatFeature(feat)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Enterprise / High Volume Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-32 max-w-4xl mx-auto bg-linear-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8"
            >
                <div>
                    <h4 className="text-2xl font-bold text-white mb-2">Need a custom enterprise setup?</h4>
                    <p className="text-slate-400">For chains with 10+ locations needing custom SLA guarantees and dedicated account management.</p>
                </div>
                <button className="whitespace-nowrap px-8 py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                    Contact Sales
                </button>
            </motion.div>

        </div>
    </div>
  );
}
