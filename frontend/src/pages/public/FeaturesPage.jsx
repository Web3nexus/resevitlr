import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, QrCode, Smartphone, Zap, Bot, Search, BarChart3, Clock, Lock, Users } from 'lucide-react';

export default function FeaturesPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <MonitorSmartphone className="w-6 h-6 text-blue-400" />,
      title: 'Omnichannel Order Flow',
      desc: 'Seamlessly capture orders from your website, in-store POS, QR codes, and social integrations simultaneously.',
    },
    {
      icon: <ChefHat className="w-6 h-6 text-orange-400" />,
      title: 'Kitchen Display System (KDS)',
      desc: 'Route tickets directly to prep stations. Track prep times and eliminate paper tickets for good.',
    },
    {
      icon: <Bot className="w-6 h-6 text-purple-400" />,
      title: 'AI Native Automations',
      desc: 'Scan receipts instantly using OCR, auto-categorize inventory, and analyze customer intent from chat messages.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      title: 'Live Financial Analytics',
      desc: 'Drill down into profitability by item, hour, or location with our real-time reporting engine.',
    },
    {
      icon: <Users className="w-6 h-6 text-amber-400" />,
      title: 'Intelligent Staff Routing',
      desc: 'Manage shifts, calculate tips automatically, and assign specific tables to specific servers.',
    },
    {
      icon: <Lock className="w-6 h-6 text-rose-400" />,
      title: 'Role-Based Access Control',
      desc: 'Ensure your data is safe. Assign granular permissions to waitstaff, managers, and system administrators.',
    }
  ];

  return (
    <div className="w-full relative py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-24">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block mb-4 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-sm font-black uppercase tracking-widest">
                    The Platform Core
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6"
                >
                    Built to handle the chaos.
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-400 leading-relaxed"
                >
                    Resevit isn't just a point of sale. It's a complete operating system designed from the ground up to unify your entire hospitality stack.
                </motion.p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                {features.map((feat, i) => (
                    <motion.div
                        key={i}
                        variants={fadeIn}
                        className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/50 transition-colors group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            {feat.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Deep Dive Section */}
            <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col lg:flex-row">
                <div className="p-12 lg:p-20 lg:w-1/2 flex flex-col justify-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-6">QR Code Menus & Ordering</h2>
                    <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                        Let customers skip the line. Generate beautiful QR codes for specific tables. Customers scan, browse your digital menu, and pay directly from their device. Tickets are sent straight to the kitchen.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-slate-300 font-medium"><Zap className="w-5 h-5 text-amber-500" /> Apple Pay & Google Pay ready</li>
                        <li className="flex items-center gap-3 text-slate-300 font-medium"><Zap className="w-5 h-5 text-amber-500" /> Instant menu updates (86 items instantly)</li>
                        <li className="flex items-center gap-3 text-slate-300 font-medium"><Zap className="w-5 h-5 text-amber-500" /> Zero hardware required</li>
                    </ul>
                </div>
                <div className="lg:w-1/2 bg-slate-950 p-12 flex items-center justify-center relative min-h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent"></div>
                    <div className="w-64 aspect-[9/19] rounded-[2rem] border-[8px] border-slate-800 bg-white relative z-10 shadow-2xl flex flex-col overflow-hidden">
                        <div className="bg-slate-100 p-4 border-b">
                            <div className="w-full h-32 bg-slate-200 rounded-xl mb-4 flex items-center justify-center">
                                <QrCode className="w-12 h-12 text-slate-400" />
                            </div>
                            <div className="h-6 w-3/4 bg-slate-900 rounded-lg mb-2"></div>
                            <div className="h-4 w-1/2 bg-slate-300 rounded-lg"></div>
                        </div>
                        <div className="flex-1 p-4 space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-16 h-16 bg-slate-200 rounded-lg shrink-0"></div>
                                    <div className="space-y-2 flex-1 pt-1">
                                        <div className="h-3 w-full bg-slate-300 rounded"></div>
                                        <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t mt-auto">
                            <div className="w-full h-10 bg-blue-600 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>
    </div>
  );
}

function MonitorSmartphone(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10 16 4-4"/>
      <path d="m14 16-4-4"/>
      <rect width="20" height="14" x="2" y="3" rx="2"/>
      <path d="M8 21h8"/>
      <path d="M12 17v4"/>
    </svg>
  );
}
