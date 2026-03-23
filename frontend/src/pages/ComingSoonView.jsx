import React from 'react';
import { LayoutDashboard, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComingSoonView = ({ title, description }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500 animate-pulse">
          <Clock size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{title || 'Coming Soon'}</h1>
          <p className="text-slate-500">
            {description || "We're working hard to bring this feature to your dashboard. Stay tuned for updates!"}
          </p>
        </div>

        <div className="pt-4">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonView;
