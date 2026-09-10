import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Code2,
  BarChart2,
  Zap,
} from 'lucide-react';
import { fetchScreenerStocks } from '../services/api';
import { ScreenerStockItem } from '../types';

interface StockScreenerProps {
  onInspectKite: (symbol: string) => void;
}

export const StockScreener: React.FC<StockScreenerProps> = ({ onInspectKite }) => {
  const [stocks, setStocks] = useState<ScreenerStockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshedAt, setRefreshedAt] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'gainers' | 'losers' | 'etf' | 'bluechip'>('all');
  const [sortBy, setSortBy] = useState<'gain_desc' | 'loss_desc' | 'price_desc' | 'market_cap'>('gain_desc');

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await fetchScreenerStocks(forceRefresh);
      setStocks(data.stocks || []);
      setRefreshedAt(data.refreshedAt || new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load screener stocks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 15 * 60 * 1000); // 15m auto-sync
    return () => clearInterval(interval);
  }, []);

  // Filter & Sort Logic
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'gainers') return stock.pctChange > 0;
    if (activeFilter === 'losers') return stock.pctChange < 0;
    if (activeFilter === 'etf') return stock.assetClass.includes('ETF');
    if (activeFilter === 'bluechip') return stock.assetClass === 'Large Cap Stock';

    return true;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === 'gain_desc') return b.pctChange - a.pctChange;
    if (sortBy === 'loss_desc') return a.pctChange - b.pctChange;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'market_cap') return b.marketCap - a.marketCap;
    return 0;
  });

  const topGainersCount = stocks.filter((s) => s.pctChange > 0).length;
  const topLosersCount = stocks.filter((s) => s.pctChange < 0).length;

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Live Indian Stock Screener (NSE)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono">
              100% Yahoo Finance Realtime API
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time price tracking, intraday gains/drops, 52-week ranges, and volume stats for Indian stocks & ETFs
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-1 font-semibold text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span>{topGainersCount} Advancing</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 font-semibold text-rose-400">
              <TrendingDown className="h-4 w-4" />
              <span>{topLosersCount} Declining</span>
            </div>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all disabled:opacity-50"
            title="Force refresh live quotes from Yahoo Finance"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching...' : 'Refresh Yahoo Live'}</span>
          </button>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by symbol or company name (e.g. RELIANCE, HDFC, BEES)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Stocks' },
            { id: 'gainers', label: '🚀 Top Gainers' },
            { id: 'losers', label: '📉 Top Losers' },
            { id: 'etf', label: 'Index & Gold ETFs' },
            { id: 'bluechip', label: 'Blue Chips' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeFilter === pill.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sorting selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="gain_desc">Sort: Highest Gain (%)</option>
            <option value="loss_desc">Sort: Highest Loss (%)</option>
            <option value="price_desc">Sort: Price (High to Low)</option>
            <option value="market_cap">Sort: Market Cap</option>
          </select>
        </div>
      </div>

      {/* Main Stock Screener Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Company & Ticker</th>
                <th className="py-3.5 px-4">Live Price</th>
                <th className="py-3.5 px-4">Day Gain / Drop</th>
                <th className="py-3.5 px-4">Day Range (OHLC)</th>
                <th className="py-3.5 px-4">52-Week Range</th>
                <th className="py-3.5 px-4">Volume</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4 text-right">Kite Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading && stocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Fetching Real-Time Stock Quotes from Yahoo Finance API...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                    No stocks found matching "{searchTerm}" for active filter.
                  </td>
                </tr>
              ) : (
                sortedStocks.map((stock) => {
                  const isGain = stock.pctChange >= 0;
                  const rangeSpan = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow;
                  const rangePct =
                    rangeSpan > 0
                      ? Math.min(100, Math.max(0, ((stock.price - stock.fiftyTwoWeekLow) / rangeSpan) * 100))
                      : 50;

                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Ticker & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-extrabold text-sm text-white font-mono group-hover:text-emerald-400 transition-colors">
                                NSE:{stock.symbol}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                                {stock.assetClass}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Live Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-sm font-mono text-white">
                          ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Day Gain / Loss Badge */}
                      <td className="py-3.5 px-4">
                        <div
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${
                            isGain
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {isGain ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          <span>
                            {isGain ? '+' : ''}₹{stock.netChange.toFixed(2)} ({isGain ? '+' : ''}
                            {stock.pctChange.toFixed(2)}%)
                          </span>
                        </div>
                      </td>

                      {/* OHLC Candlestick Range */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        <div>
                          High: <span className="text-emerald-400 font-bold">₹{stock.high}</span>
                        </div>
                        <div>
                          Low: <span className="text-rose-400 font-bold">₹{stock.low}</span>
                        </div>
                      </td>

                      {/* 52-Week Range Progress Bar */}
                      <td className="py-3.5 px-4 w-44">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                          <span>₹{stock.fiftyTwoWeekLow?.toFixed(0) || 'N/A'}</span>
                          <span>₹{stock.fiftyTwoWeekHigh?.toFixed(0) || 'N/A'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-full"
                            style={{ width: `${rangePct}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Traded Volume */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                        {stock.volume > 0 ? (stock.volume / 1000).toFixed(0) + 'k' : '—'}
                      </td>

                      {/* Sector */}
                      <td className="py-3.5 px-4 text-slate-300 text-xs truncate max-w-[130px]">
                        {stock.sector}
                      </td>

                      {/* Zerodha Kite Inspector Trigger */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onInspectKite(stock.symbol)}
                          className="px-2.5 py-1 rounded bg-sky-950/60 hover:bg-sky-900/80 text-sky-400 border border-sky-800/50 text-[11px] font-semibold transition-colors inline-flex items-center space-x-1"
                        >
                          <Code2 className="h-3 w-3" />
                          <span>Kite JSON</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
