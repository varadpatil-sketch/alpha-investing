import React, { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, ShoppingCart } from 'lucide-react';
import { fetchMarketIndices, MarketIndexItem } from '../services/api';
import { usePaperTrading } from '../context/PaperTradingContext';

export const MarketTickerBar: React.FC = () => {
  const { openTradeModal } = usePaperTrading();
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

  const handleTickerClick = (sym: string, price: number) => {
    let cleanSym = 'NIFTYBEES';
    if (sym.includes('SENSEX')) cleanSym = 'TATAMOTORS';
    else if (sym.includes('BANK')) cleanSym = 'HDFCBANK';
    else if (sym.includes('MIDCAP')) cleanSym = 'PERSISTENT';
    else if (sym.includes('FIN')) cleanSym = 'BAJFINANCE';
    else if (sym.includes('NIFTY')) cleanSym = 'RELIANCE';

    openTradeModal(cleanSym, 'BUY', price > 0 ? price : undefined);
  };

  return (
    <div className="w-full bg-slate-950/90 border-b border-slate-800/80 py-2 px-4 shadow-inner sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Status Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 hidden sm:flex items-center space-x-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>NSE / BSE Benchmarks</span>
          </span>
        </div>

        {/* Indices Ticker Items */}
        <div className="flex-1 flex items-center justify-end sm:justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {indices.length > 0 ? (
            indices.map((idx) => (
              <button
                key={idx.symbol}
                onClick={() => handleTickerClick(idx.symbol, idx.price)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 shrink-0 shadow-sm font-mono transition-all group cursor-pointer"
                title={`Click to Paper Trade ${idx.symbol}`}
              >
                <span className="font-bold text-slate-400 group-hover:text-amber-300 text-[10px] sm:text-[11px] uppercase">{idx.symbol}</span>
                <span className="font-extrabold text-white text-xs">
                  {idx.price ? idx.price.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 'N/A'}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                    idx.change >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {idx.change >= 0 ? '+' : ''}
                  {idx.pctChange.toFixed(1)}%
                </span>
              </button>
            ))
          ) : isLoading ? (

            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono py-1">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400" />
              <span>Syncing Indian Market Benchmarks...</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">Live feed offline</span>
          )}
        </div>
      </div>
    </div>
  );
};
