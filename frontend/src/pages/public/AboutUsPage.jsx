import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Trophy, Code2 } from 'lucide-react';

export default function AboutUsPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true }
  };

  return (
    <div className="w-full relative overflow-hidden bg-slate-950">
        
        {/* Dynamic Header */}
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-600/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight mb-8"
                >
                    Building the primitives of modern hospitality.
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
                >
                    We act as the operating system for thousands of restaurants. Our mission is to eliminate the friction between kitchen, floor, and customer.
                </motion.p>
            </div>
        </section>

        {/* Stats Grid */}
        <section className="py-20 px-6 bg-slate-900/30 border-y border-slate-800/50">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    variants={staggerContainer} initial="initial" whileInView="whileInView"
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
                >
                    {[
                        { num: '$2B+', label: 'Volume Processed', icon: Globe, color: 'text-rose-400' },
                        { num: '4,000+', label: 'Active Locations', icon: Trophy, color: 'text-amber-400' },
                        { num: '50M+', label: 'Reservations Handled', icon: Users, color: 'text-blue-400' },
                        { num: '99.99%', label: 'Uptime SLA', icon: Code2, color: 'text-emerald-400' },
                    ].map((stat, i) => (
                        <motion.div key={i} variants={fadeIn} className="text-center">
                            <div className="flex justify-center mb-4">
                                <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                            </div>
                            <div className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{stat.num}</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* The Story */}
        <section className="py-32 px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" className="bg-slate-900 border border-slate-800 p-12 md:p-20 rounded-[3rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">Our Story</h2>
                    <div className="prose prose-invert prose-lg text-slate-400 leading-relaxed max-w-none">
                        <p>
                            Resevit was born out of frustration. Our founders operated multiple high-volume venues and realized they were taping together half a dozen different software tools just to get through a Friday night service.
                        </p>
                        <p>
                            There was independent POS software, separate reservation software, disjointed KDS systems, and disjointed payroll systems. Data didn't sync. Customers got lost. Staff got overwhelmed.
                        </p>
                        <p>
                            We decided to build the single, unified database that hospitality groups actually need. An operating system where an online reservation automatically builds a profile, informs the POS, alerts the KDS, and links to final financial reporting. All powered by AI to automate the mundane backend tasks.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Team Representation */}
        <section className="py-20 px-6 border-t border-slate-800/50">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Backed by the best</h2>
                <p className="text-slate-400 mb-16 max-w-2xl mx-auto">Our core team comes from companies that scaled globally. We're engineering-heavy and product-obsessed.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-full mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300 relative overflow-hidden">
                                {/* Synthetic team avatars */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"></div>
                            </div>
                            <div className="h-4 w-24 bg-slate-800 rounded mb-2"></div>
                            <div className="h-3 w-16 bg-slate-800/50 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

    </div>
  );
}
