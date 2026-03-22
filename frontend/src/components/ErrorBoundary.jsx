import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRestart = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Background Highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-xl w-full text-center relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Something went wrong.</h1>
            <p className="text-slate-400 mb-2 leading-relaxed">
              We've encountered an unexpected error. Our team has been notified.
            </p>
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl mb-10 text-left overflow-hidden">
               <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Error Diagnostic</p>
               <p className="text-xs font-mono text-red-400 wrap-break-word line-clamp-2 italic">
                  {this.state.error?.toString() || "Unknown System Failure"}
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-200"
              >
                <RefreshCcw className="w-5 h-5" />
                Reload Page
              </button>
              <button
                onClick={this.handleRestart}
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Home
              </button>
            </div>
            
            <p className="mt-12 text-slate-500 text-xs">
              If the problem persists, please contact <a href="mailto:support@resevit.com" className="text-blue-400 hover:underline">support@resevit.com</a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
