import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React UI error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b1120] text-slate-100 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Something Went Wrong</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                An unexpected UI exception occurred in the application layer. Don't worry, your portfolio data and market sessions remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left font-mono text-xs text-rose-400 overflow-x-auto max-h-32">
                <span className="text-slate-500 block mb-1">Diagnostic Log:</span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
