import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Zap, Shield, Globe, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { COUNTRIES } from '../utils/countries';

export default function BillingView() {
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, statusRes] = await Promise.all([
        api.get('/billing/plans'),
        api.get('/billing/status')
      ]);
      setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      setStatus(statusRes.data);
      setCountry(statusRes.data.country || '');
    } catch (err) {
      console.error("Failed to fetch billing data", err);
      setError("Unable to load billing information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribe = async (planSlug, interval = 'monthly') => {
    if (!country) {
      alert("Please select your country first to determine the best payment gateway.");
      return;
    }

    setSubscribing(planSlug);
    setError(null);
    try {
      const res = await api.post('/billing/subscribe', {
        plan_slug: planSlug,
        interval: interval,
        country: country
      });
      
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setError("Payment initialization failed. Please contact support.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start payment process.");
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="font-medium animate-pulse">Syncing billing registry...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Billing & Subscription
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your commercial plan and payment methods.</p>
        </div>
        
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Regional Gateway</p>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-transparent text-slate-800 font-bold text-sm outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-white">Select Country</option>
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code} className="bg-white">
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Current Plan Overview */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
              Current Active Tier
            </div>
            <h2 className="text-4xl font-black">{status?.plan_name || 'Free'}</h2>
            <p className="text-blue-100 max-w-md">Your account is currently on the {status?.plan_name} model. Features are subject to this tier's limitations.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-full md:w-auto min-w-[240px]">
            <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-4">Subscription Status</div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-tight">{status?.status || 'Active'}</span>
              <Shield className="w-4 h-4 text-blue-300" />
            </div>
            <div className="text-[10px] text-blue-200 mb-1">Billing Provider</div>
            <div className="font-bold text-sm capitalize">{status?.provider || 'System Internal'}</div>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <CreditCard className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Array.isArray(plans) ? plans : []).map((plan) => (
          <div key={plan.id} className={`bg-white border-2 rounded-3xl p-8 flex flex-col transition-all group relative shadow-sm ${
            status?.plan_slug === plan.slug ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'
          }`}>
            {plan.slug === 'pro' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">${plan.monthly_price}</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-2">What's included</p>
              <ul className="space-y-3">
                {Array.isArray(plan.features) && plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => handleSubscribe(plan.slug)}
              disabled={status?.plan_slug === plan.slug || subscribing === plan.slug}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                status?.plan_slug === plan.slug 
                  ? 'bg-slate-100 text-slate-400 cursor-default' 
                  : 'bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white active:scale-95 transition-colors'
              }`}
            >
              {subscribing === plan.slug ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : status?.plan_slug === plan.slug ? (
                'Current Plan'
              ) : (
                <>
                  Checkout Now <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ))}

        {/* Custom Corporate Box */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
          <Zap className="w-10 h-10 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Enterprise Flex</h3>
            <p className="text-slate-500 text-sm mt-1">Need a specialized setup for 50+ locations?</p>
          </div>
          <a 
            href={`mailto:${status?.sales_email || 'sales@resevit.com'}?subject=Enterprise%20Flex%20Inquiry`}
            className="text-blue-400 font-bold text-xs uppercase tracking-widest hover:text-blue-300 transition-colors"
          >
            Contact Sales Team
          </a>
        </div>
      </div>
    </div>
  );
}
