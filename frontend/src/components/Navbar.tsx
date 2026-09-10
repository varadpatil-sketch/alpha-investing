import React, { useEffect, useState } from 'react';
import { TrendingUp, ShieldCheck, User, Bookmark, LogOut, Zap, RefreshCw, BarChart2, Sparkles, CandlestickChart } from 'lucide-react';
import { UserProfile } from '../types';
import { fetchMarketIndices, MarketIndexItem } from '../services/api';

interface NavbarProps {
  activeTab: 'recommendations' | 'screener' | 'terminal';
  onChangeTab: (tab: 'recommendations' | 'screener' | 'terminal') => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSaved: () => void;
  onOpenKiteModal?: () => void;
  onQuickDemoLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  user,
  onOpenAuth,
  onLogout,
  onOpenSaved,
  onQuickDemoLogin,
}) => {
  const [indices, setIndices] = useState<MarketIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadIndices = async () => {
      const data = await fetchMarketIndices();
      if (data && data.length > 0) {
        setIndices(data);
      }
      setIsLoading(false);
    };

    loadIndices();
    const interval = setInterval(loadIndices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">Alpha</span>
              <span className="text-emerald-400 font-extrabold text-lg">Investing</span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
              NSE / BSE Stock Recommendations
            </p>
          </div>
        </div>

        {/* View Mode Navigation Tabs (Center) */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangeTab('recommendations')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Portfolio Advisor</span>
            <span className="sm:hidden">Advisor</span>
          </button>

          <button
            onClick={() => onChangeTab('screener')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'screener'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Live Stock Screener</span>
            <span className="sm:hidden">Screener</span>
          </button>

          <button
            onClick={() => onChangeTab('terminal')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'terminal'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CandlestickChart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pro Terminal</span>
            <span className="sm:hidden">Terminal</span>
          </button>
        </div>

        {/* Live Market Indices Ticker & User Controls (Right) */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Dynamic Real-Time Benchmark Indices Ticker */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
            {indices.length > 0 ? (
              <div className="flex items-center space-x-2.5 font-mono text-[11px]">
                {indices.map((idx, index) => (
                  <React.Fragment key={idx.symbol}>
                    <div className="flex items-center space-x-1 whitespace-nowrap">
                      <span className="font-bold text-slate-400">{idx.symbol}:</span>
                      <span className="font-semibold text-white">
                        {idx.price ? idx.price.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 'N/A'}
                      </span>
                      <span
                        className={`font-bold ${
                          idx.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {idx.change >= 0 ? '+' : ''}
                        {idx.pctChange.toFixed(1)}%
                      </span>
                    </div>
                    {index < indices.length - 1 && <span className="text-slate-700">|</span>}
                  </React.Fragment>
                ))}
              </div>
            ) : isLoading ? (
              <span className="font-medium text-slate-400 flex items-center space-x-1 text-xs whitespace-nowrap">
                <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />
                <span>Yahoo Live...</span>
              </span>
            ) : (
              <span className="font-medium text-slate-400 text-xs">Offline</span>
            )}
          </div>

          <button
            onClick={onOpenSaved}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 transition-colors"
            title="Saved Portfolios"
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Saved</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-xs text-emerald-300 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onQuickDemoLogin}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all shadow-sm"
                title="Direct 1-Click Demo Login for Testing"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Demo Login</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

