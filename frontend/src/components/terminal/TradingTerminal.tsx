import React, { useEffect, useState } from 'react';
import {
  CandlestickChart,
  LineChart,
  AreaChart,
  BarChart3,
  Sliders,
  Search,
  RefreshCw,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  Newspaper,
} from 'lucide-react';
import { fetchHistoricalCandles, fetchScreenerStocks, CandleData } from '../../services/api';
import { ScreenerStockItem } from '../../types';
import { LightweightChartContainer, ChartType } from './LightweightChartContainer';
import { IndicatorSettingsModal } from './IndicatorSettingsModal';
import { DEFAULT_INDICATOR_SETTINGS, IndicatorSettings } from '../../services/indicators/indicatorEngine';
import { TickerNewsDrawer } from '../common/TickerNewsDrawer';


const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '1Y', value: '1Y' },
];

export const TradingTerminal: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('RELIANCE.NS');
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [chartType, setChartType] = useState<ChartType>('candlestick');

  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);

  // Watchlist state
  const [watchlist, setWatchlist] = useState<ScreenerStockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState<boolean>(true);

  // Indicators State with LocalStorage Persistence
  const [indicators, setIndicators] = useState<IndicatorSettings>(() => {
    const saved = localStorage.getItem('alpha_terminal_indicators');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_INDICATOR_SETTINGS;
      }
    }
    return DEFAULT_INDICATOR_SETTINGS;
  });

  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isNewsDrawerOpen, setIsNewsDrawerOpen] = useState<boolean>(false);

  // Save indicator settings
  const handleUpdateIndicators = (updated: IndicatorSettings) => {
    setIndicators(updated);
    localStorage.setItem('alpha_terminal_indicators', JSON.stringify(updated));
  };

  // Load Watchlist
  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const data = await fetchScreenerStocks();
        if (data && data.stocks) {
          setWatchlist(data.stocks);
        }
      } catch (err) {
        console.error('Failed to load terminal watchlist', err);
      } finally {
        setIsLoadingWatchlist(false);
      }
    };

    loadWatchlist();
  }, []);

  // Fetch OHLCV Candles for Active Symbol and Timeframe
  useEffect(() => {
    const loadChartData = async () => {
      setIsLoadingChart(true);
      setChartError(null);

      try {
        const res = await fetchHistoricalCandles(symbol, timeframe);
        if (res && res.candles && res.candles.length > 0) {
          setCandles(res.candles);
        } else {
          setChartError(`No chart data available for ${symbol}`);
        }
      } catch (err: any) {
        setChartError(err.message || 'Failed to fetch historical chart data');
      } finally {
        setIsLoadingChart(false);
      }
    };

    loadChartData();
  }, [symbol, timeframe]);

  const filteredWatchlist = watchlist.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`w-full bg-slate-950 text-slate-100 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 p-4' : 'min-h-[calc(100vh-4rem)] p-4 max-w-[1600px] mx-auto'
      }`}
    >
      {/* Terminal Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl mb-4 shadow-lg">
        {/* Left: Active Symbol & Name */}
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2">
            <span className="font-extrabold text-sm text-emerald-400 font-mono">
              {symbol.replace('.NS', '').replace('^', '')}
            </span>
            <span className="text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              NSE
            </span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xs font-bold text-white tracking-wide">
              {watchlist.find((w) => w.symbol === symbol.replace('.NS', ''))?.name || symbol}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">TradingView Pro Canvas Terminal</p>
          </div>
        </div>

        {/* Center: Timeframe Picker & Chart Type Controls */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 space-x-1">
            <Clock className="h-3.5 w-3.5 text-slate-500 ml-1.5 hidden sm:inline" />
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all ${
                  timeframe === tf.value
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 space-x-1">
            <button
              onClick={() => setChartType('candlestick')}
              className={`p-1.5 rounded text-xs transition-all ${
                chartType === 'candlestick' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Standard Candlestick"
            >
              <CandlestickChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('heikin-ashi')}
              className={`p-1.5 rounded text-xs transition-all ${
                chartType === 'heikin-ashi' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Heikin-Ashi Smoothed Candles"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded text-xs transition-all ${
                chartType === 'line' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Line Chart"
            >
              <LineChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded text-xs transition-all ${
                chartType === 'area' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Area Gradient Chart"
            >
              <AreaChart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Technical Indicator Engine & Fullscreen Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsNewsDrawerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-extrabold text-xs transition-all"
          >
            <Newspaper className="h-3.5 w-3.5 text-indigo-400" />
            <span>Stock News</span>
          </button>

          <button
            onClick={() => setIsIndicatorModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Indicators</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Terminal Grid: Watchlist Sidebar + Lightweight Chart Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Watchlist Sidebar (1 Column) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-[620px]">
          {/* Watchlist Header & Search */}
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>Nifty & BSE Watchlist</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Yahoo Feed</span>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Watchlist Scrollable Item List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {isLoadingWatchlist ? (
              <div className="flex items-center justify-center h-32 text-slate-500 text-xs space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Loading Watchlist...</span>
              </div>
            ) : filteredWatchlist.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No matching stocks found</p>
            ) : (
              filteredWatchlist.map((item) => {
                const itemYahooSymbol = `${item.symbol}.NS`;
                const isSelected = symbol === itemYahooSymbol || symbol === item.symbol;

                return (
                  <button
                    key={item.symbol}
                    onClick={() => setSymbol(itemYahooSymbol)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-xs text-white font-mono flex items-center space-x-1.5">
                        <span>{item.symbol}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{item.name}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-xs font-mono text-white">
                        ₹{item.price ? item.price.toLocaleString('en-IN') : 'N/A'}
                      </p>
                      <div
                        className={`inline-flex items-center space-x-0.5 text-[10px] font-bold font-mono ${
                          item.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {item.pctChange >= 0 ? (
                          <TrendingUp className="h-2.5 w-2.5" />
                        ) : (
                          <TrendingDown className="h-2.5 w-2.5" />
                        )}
                        <span>
                          {item.pctChange >= 0 ? '+' : ''}
                          {item.pctChange.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chart Canvas (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col">
          {isLoadingChart ? (
            <div className="w-full h-[620px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                <span className="text-sm font-semibold text-slate-300">
                  Fetching live OHLCV candles from Yahoo Finance...
                </span>
              </div>
            </div>
          ) : chartError ? (
            <div className="w-full h-[620px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center p-6 text-center">
              <div className="max-w-md space-y-2">
                <p className="text-rose-400 font-bold text-sm">{chartError}</p>
                <p className="text-xs text-slate-400">
                  Try switching timeframe to 1D or select another symbol from the Watchlist.
                </p>
              </div>
            </div>
          ) : (
            <LightweightChartContainer
              candles={candles}
              symbol={symbol.replace('.NS', '')}
              chartType={chartType}
              indicators={indicators}
            />
          )}
        </div>
      </div>

      {/* Indicator Configuration Modal */}
      <IndicatorSettingsModal
        isOpen={isIndicatorModalOpen}
        onClose={() => setIsIndicatorModalOpen(false)}
        indicators={indicators}
        onChangeIndicators={handleUpdateIndicators}
      />

      {/* Ticker-Specific News Drawer */}
      <TickerNewsDrawer
        symbol={symbol.replace('.NS', '')}
        isOpen={isNewsDrawerOpen}
        onClose={() => setIsNewsDrawerOpen(false)}
      />
    </div>
  );
};
