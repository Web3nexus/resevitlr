import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function StatusModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success' // 'success' | 'error' | 'info'
}) {
  const getConfig = () => {
    switch(type) {
      case 'error': return {
        icon: XCircle,
        iconColor: 'text-red-400',
        bgColor: 'bg-red-400/10',
        borderColor: 'border-red-400/20',
        buttonColor: 'bg-red-600 hover:bg-red-700'
      };
      case 'info': return {
        icon: Info,
        iconColor: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/20',
        buttonColor: 'bg-blue-600 hover:bg-blue-700'
      };
      default: return {
        icon: CheckCircle,
        iconColor: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        borderColor: 'border-emerald-400/20',
        buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
      };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${config.bgColor} blur-3xl`} />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-xl transition-colors group"
            >
              <X className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
            </button>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className={`w-20 h-20 rounded-2xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center mb-6 shadow-inner`}>
                <Icon className={`w-10 h-10 ${config.iconColor}`} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{message}</p>

              <button 
                onClick={onClose}
                className={`w-full py-3.5 px-6 rounded-xl ${config.buttonColor} text-white font-bold shadow-lg transition-all active:scale-95`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
