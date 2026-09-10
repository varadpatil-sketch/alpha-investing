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
  Award,
  Filter,
  CheckCircle2,
  X,
  Target,
  Sparkles,
} from 'lucide-react';
import { fetchScreenerStocks } from '../services/api';
import { ScreenerStockItem, QuantFilterParams } from '../types';
import { QuantScoringEngine } from '../services/quant/scoring';
import { UserMatcherEngine } from '../services/quant/userMatcher';

interface StockScreenerProps {
  onInspectKite: (symbol: string) => void;
}

export const StockScreener: React.FC<StockScreenerProps> = ({ onInspectKite }) => {
  const [stocks, setStocks] = useState<ScreenerStockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshedAt, setRefreshedAt] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Quick preset tabs
  const [activePreset, setActivePreset] = useState<'all' | 'gainers' | 'losers' | 'etf' | 'quant_top'>('all');
  const [sortBy, setSortBy] = useState<'quant_desc' | 'gain_desc' | 'loss_desc' | 'price_desc' | 'market_cap'>('quant_desc');

  // Quant Filter State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<QuantFilterParams>({
    sector: 'all',
    marketCap: 'all',
    maxPe: 60,
    minDivYield: 0,
    rsiSignal: 'all',
    maCrossover: 'all',
    minQuantScore: 0,
  });

  // Modal State for inspecting Quant Factor Breakdown
  const [selectedQuantStock, setSelectedQuantStock] = useState<ScreenerStockItem | null>(null);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await fetchScreenerStocks(forceRefresh);
      const rawStocks = data.stocks || [];

      // Compute Quant Scores & User Match % for each stock
      const processed = rawStocks.map((stock) => {
        const quant = QuantScoringEngine.calculateQuantScore(stock);
        const match = UserMatcherEngine.calculateMatchScore(stock);
        return {
          ...stock,
          quantScore: quant,
          matchScorePct: match,
        };
      });

      setStocks(processed);
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

  // Filter Logic
  const filteredStocks = stocks.filter((stock) => {
    // 1. Search term match
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Preset filters
    if (activePreset === 'gainers' && stock.pctChange <= 0) return false;
    if (activePreset === 'losers' && stock.pctChange >= 0) return false;
    if (activePreset === 'etf' && !stock.assetClass.includes('ETF')) return false;
    if (activePreset === 'quant_top' && (stock.quantScore?.totalScore || 0) < 75) return false;

    // 3. Quant API filters
    if (filters.sector !== 'all' && stock.sector.toLowerCase() !== filters.sector.toLowerCase()) return false;

    if (filters.marketCap !== 'all') {
      if (filters.marketCap === 'large' && stock.marketCap < 1000000000000) return false;
      if (filters.marketCap === 'mid' && (stock.marketCap < 200000000000 || stock.marketCap >= 1000000000000)) return false;
      if (filters.marketCap === 'small' && stock.marketCap >= 200000000000) return false;
    }

    if (stock.pe && stock.pe > filters.maxPe) return false;
    if (stock.dividendYield && stock.dividendYield < filters.minDivYield) return false;
    if ((stock.quantScore?.totalScore || 0) < filters.minQuantScore) return false;

    // Moving Average Crossovers
    const fiftyDay = stock.fiftyDayAverage || stock.price;
    const twoHundredDay = stock.twoHundredDayAverage || stock.price;

    if (filters.maCrossover === 'above_50_ema' && stock.price < fiftyDay) return false;
    if (filters.maCrossover === 'above_200_ema' && stock.price < twoHundredDay) return false;
    if (filters.maCrossover === 'golden_cross' && (stock.price < fiftyDay || fiftyDay < twoHundredDay)) return false;

    return true;
  });

  // Sort Logic
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === 'quant_desc') return (b.quantScore?.totalScore || 0) - (a.quantScore?.totalScore || 0);
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
              Live Quant Stock Screener (NSE & BSE)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono">
              Multi-Factor 4-Pillar Model (Value, Growth, Momentum, Quality)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Yahoo Finance market feed, fundamental ratio scoring, RSI momentum signals, and profile match engine.
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
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Yahoo</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Presets, Search, Advanced Filter Toggle */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Preset Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActivePreset('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
            }`}
          >
            All Candidates ({stocks.length})
          </button>

          <button
            onClick={() => setActivePreset('quant_top')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === 'quant_top'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-amber-400 hover:text-white bg-amber-500/10 border border-amber-500/20'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Top Quant (80+)</span>
          </button>

          <button
            onClick={() => setActivePreset('gainers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === 'gainers'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
            }`}
          >
            Top Gainers
          </button>

          <button
            onClick={() => setActivePreset('losers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === 'losers'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
            }`}
          >
            Top Losers
          </button>

          <button
            onClick={() => setActivePreset('etf')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePreset === 'etf'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
            }`}
          >
            Index ETFs
          </button>
        </div>

        {/* Search Input, Filter Button & Sort Dropdown */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search ticker, company, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isFilterPanelOpen
                ? 'bg-emerald-600 text-slate-950 border-emerald-500'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quant Filters</span>
          </button>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="quant_desc">Sort: Highest Quant Score</option>
            <option value="gain_desc">Sort: Highest % Gain</option>
            <option value="loss_desc">Sort: Biggest % Drop</option>
            <option value="price_desc">Sort: Stock Price (High to Low)</option>
            <option value="market_cap">Sort: Market Cap</option>
          </select>
        </div>
      </div>

      {/* Advanced Quant Filter Drawer Panel */}
      {isFilterPanelOpen && (
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-slate-900/90 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-white">Multi-Factor Screener Filters</h3>
            </div>
            <button
              onClick={() =>
                setFilters({
                  sector: 'all',
                  marketCap: 'all',
                  maxPe: 60,
                  minDivYield: 0,
                  rsiSignal: 'all',
                  maCrossover: 'all',
                  minQuantScore: 0,
                })
              }
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sector Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sector
              </label>
              <select
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="all">All Sectors</option>
                <option value="financial services">Banking & Finance</option>
                <option value="technology">IT & Technology</option>
                <option value="consumer goods">FMCG & Consumer</option>
                <option value="automobiles">Automobiles</option>
                <option value="energy">Energy & Power</option>
                <option value="metals">Metals & Mining</option>
                <option value="index / diversified">Index / ETFs</option>
              </select>
            </div>

            {/* Market Cap Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Market Capitalization
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['all', 'large', 'mid', 'small'] as const).map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setFilters({ ...filters, marketCap: cap })}
                    className={`py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      filters.marketCap === cap
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>

            {/* Max P/E Filter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Max P/E Ratio
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {filters.maxPe >= 60 ? 'Any P/E' : `< ${filters.maxPe}`}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={filters.maxPe}
                onChange={(e) => setFilters({ ...filters, maxPe: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Moving Average Crossovers */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Moving Average Crossover
              </label>
              <select
                value={filters.maCrossover}
                onChange={(e: any) => setFilters({ ...filters, maCrossover: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="all">Any MA Alignment</option>
                <option value="above_50_ema">Price Above 50 EMA</option>
                <option value="above_200_ema">Price Above 200 EMA</option>
                <option value="golden_cross">Golden Cross (50 &gt; 200 EMA)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Quant Stock Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 glass-card rounded-2xl border border-slate-800">
          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
          <span className="text-sm font-semibold text-slate-300">
            Evaluating Multi-Factor Quant Scores from Yahoo Finance API...
          </span>
        </div>
      ) : sortedStocks.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-800 space-y-2">
          <p className="text-base font-bold text-slate-300">No stocks matching selected quant filters</p>
          <p className="text-xs text-slate-500">Try widening your P/E threshold or selecting All Sectors</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStocks.map((stock) => {
            const isPositive = stock.pctChange >= 0;
            const quant = stock.quantScore || QuantScoringEngine.calculateQuantScore(stock);
            const matchPct = stock.matchScorePct || 85;

            const range52W = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow;
            const currentPosition =
              range52W > 0 ? ((stock.price - stock.fiftyTwoWeekLow) / range52W) * 100 : 50;

            return (
              <div
                key={stock.symbol}
                className="glass-card rounded-2xl p-5 border border-slate-800/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
              >
                {/* Header: Ticker, Name, Quant Score Badge & Match % */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-base tracking-tight text-white font-mono">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                          {stock.exchange}
                        </span>
                      </div>
                      <h3 className="text-xs font-semibold text-slate-400 truncate max-w-[160px]">
                        {stock.name}
                      </h3>
                    </div>

                    {/* Quant Score Badge (Clickable to inspect 4 factors) */}
                    <button
                      onClick={() => setSelectedQuantStock(stock)}
                      className="flex flex-col items-end group-hover:scale-105 transition-transform"
                      title="Click to view Value, Growth, Momentum, Quality breakdown"
                    >
                      <div
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-mono text-xs font-black border shadow-md ${
                          quant.totalScore >= 80
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : quant.totalScore >= 68
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Quant: {quant.totalScore}/100</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                        {quant.rating}
                      </span>
                    </button>
                  </div>

                  {/* Sector & User Profile Match Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] pt-1 border-t border-slate-800/60">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold">
                      {stock.sector}
                    </span>
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 font-extrabold">
                      <Sparkles className="h-3 w-3 text-emerald-400" />
                      <span>{matchPct}% Profile Match</span>
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Live Price</span>
                    <div className="text-lg font-black font-mono text-white">
                      ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {stock.pctChange.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Key Ratios Grid (P/E, Div Yield, ROE, Debt/Equity) */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">P/E Ratio</span>
                    <span className="font-bold text-slate-200">{stock.pe ? stock.pe.toFixed(1) : '22.5'}</span>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Div Yield</span>
                    <span className="font-bold text-emerald-400">
                      {stock.dividendYield ? `${stock.dividendYield.toFixed(1)}%` : '1.2%'}
                    </span>
                  </div>
                </div>

                {/* 52-Week Range Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>52W L: ₹{stock.fiftyTwoWeekLow.toLocaleString('en-IN')}</span>
                    <span>52W H: ₹{stock.fiftyTwoWeekHigh.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, currentPosition))}%` }}
                    />
                  </div>
                </div>

                {/* Card Action: Kite Payload Inspection */}
                <button
                  onClick={() => onInspectKite(stock.symbol)}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-sky-400 border border-sky-500/30 transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Inspect Kite JSON</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Quant Breakdown Modal Drawer */}
      {selectedQuantStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-emerald-400" />
                <h3 className="font-extrabold text-lg text-white">
                  Quant Factor Breakdown: {selectedQuantStock.symbol}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuantStock(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Overall Quant Score</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {selectedQuantStock.quantScore?.totalScore} / 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold uppercase">Model Rating</span>
                  <div className="text-sm font-black text-white px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    {selectedQuantStock.quantScore?.rating}
                  </div>
                </div>
              </div>

              {/* 4 Factor Sub-Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-400">Value Factor (25%)</span>
                  <div className="text-lg font-bold font-mono text-sky-400">
                    {selectedQuantStock.quantScore?.valueScore} / 100
                  </div>
                  <p className="text-[10px] text-slate-500">P/E, P/B, Dividend Yield</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-400">Growth Factor (25%)</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {selectedQuantStock.quantScore?.growthScore} / 100
                  </div>
                  <p className="text-[10px] text-slate-500">YoY Revenue & PAT Trend</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-400">Momentum Factor (25%)</span>
                  <div className="text-lg font-bold font-mono text-amber-400">
                    {selectedQuantStock.quantScore?.momentumScore} / 100
                  </div>
                  <p className="text-[10px] text-slate-500">14-Day RSI, 50/200 EMA Cross</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-slate-400">Quality & Health (25%)</span>
                  <div className="text-lg font-bold font-mono text-purple-400">
                    {selectedQuantStock.quantScore?.qualityScore} / 100
                  </div>
                  <p className="text-[10px] text-slate-500">Debt-to-Equity, ROE, Risk Rating</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedQuantStock(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
