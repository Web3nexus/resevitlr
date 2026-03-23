import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone. Please confirm to proceed.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // 'danger' | 'warning' | 'info'
}) {
  const getColors = () => {
    switch(type) {
      case 'danger': return {
        icon: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20',
        button: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
      };
      case 'warning': return {
        icon: 'text-amber-400',
        bg: 'bg-amber-400/10',
        border: 'border-amber-400/20',
        button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
      };
      default: return {
        icon: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20',
        button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
      };
    }
  };

  const colors = getColors();

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
            className="relative bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-xl transition-colors group"
            >
              <X className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-6`}>
                <AlertTriangle className={`w-8 h-8 ${colors.icon}`} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{message}</p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl ${colors.button} text-white font-medium shadow-lg transition-all active:scale-95`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
