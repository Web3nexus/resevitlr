import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Globe, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Data Collection",
      content: "We collect information you provide directly to us when you create an account, such as your name, email address, business name, and payment information. We also collect data automatically when you use our services, including IP addresses, browser types, and usage patterns.",
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "Use of Information",
      content: "We use the collected data to provide, maintain, and improve our services, process transactions, send technical notices, and communicate with you about products, services, and events.",
      icon: FileText,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Data Sharing",
      content: "We do not share your personal information with third parties except as described in this policy, such as with your consent, to comply with laws, or to protect our rights.",
      icon: Globe,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      title: "Security",
      content: "We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. This includes encryption and secure server infrastructure.",
      icon: Lock,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-24 px-6">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6">
            <Shield className="w-4 h-4" /> Legal & Transparency
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">Privacy Policy</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            At Resevit, we take your privacy seriously. This policy explains how we collect, use, and protect your data.
          </p>
          <p className="text-slate-500 text-sm mt-8 font-mono uppercase tracking-widest">Last Updated: March 24, 2026</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${section.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <section.icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="prose prose-invert prose-blue max-w-none bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Detailed Information</h2>
          <div className="space-y-8 text-slate-400 text-sm leading-relaxed">
            <div>
              <h4 className="text-white font-bold mb-2">1. Information We Collect</h4>
              <p>We collect information to provide better services to all our users. We collect information in the following ways: information you give us, information we get from your use of our services, and information from third parties.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">2. How We Use Information</h4>
              <p>We use the information we collect from all of our services to provide, maintain, protect and improve them, to develop new ones, and to protect Resevit and our users.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">3. Information We Share</h4>
              <p>We do not share personal information with companies, organizations and individuals outside of Resevit unless one of the following circumstances applies: with your consent, for external processing, or for legal reasons.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">4. Data Storage and Transfer</h4>
              <p>Your information may be stored and processed in any country where we have facilities. By using our services, you consent to the transfer of information to countries outside of your country of residence.</p>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Have questions?</p>
                <p className="text-slate-500 text-xs text-blue-400">privacy@resevit.com</p>
              </div>
            </div>
            <button 
              onClick={() => window.print()}
              className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              Print Policy
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
