import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Animated 404 number */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[120px] font-black text-white leading-none tracking-tighter opacity-10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 rotate-12">
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-10 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800/50">
          <p className="text-slate-500 text-sm">
            Need help? <a href="/help" className="text-blue-400 hover:underline">Visit our Help Center</a>
          </p>
        </div>
      </div>
    </div>
  );
}
