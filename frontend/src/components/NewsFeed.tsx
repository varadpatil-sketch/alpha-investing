import React, { useEffect, useState } from 'react';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Filter,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { fetchMarketNews, MarketNewsResponse, NewsItem } from '../services/api';
import { usePaperTrading } from '../context/PaperTradingContext';

export const NewsFeed: React.FC = () => {
  const { openTradeModal } = usePaperTrading();
  const [data, setData] = useState<MarketNewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadNews = async (cat = 'all', forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetchMarketNews(cat, forceRefresh);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load market news', err);
      setError(err.message || 'Failed to aggregate Indian financial news');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews(activeCategory);
    const interval = setInterval(() => loadNews(activeCategory, true), 5 * 60 * 1000); // 5m auto sync
    return () => clearInterval(interval);
  }, [activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
  };

  const getSentimentBadge = (sentiment: string) => {
    if (sentiment === 'BULLISH') {
      return (
        <span className="px-2.5 py-1 rounded-xl text-xs font-black uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bullish</span>
        </span>
      );
    }
    if (sentiment === 'BEARISH') {
      return (
        <span className="px-2.5 py-1 rounded-xl text-xs font-black uppercase font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          <span>Bearish</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase font-mono bg-slate-900 text-slate-400 border border-slate-800">
        Neutral
      </span>
    );
  };

  const getRelativeTime = (isoTime: string) => {
    try {
      const diffMs = Date.now() - new Date(isoTime).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 60) return `${Math.max(1, diffMins)} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'macro', label: 'Nifty & Macro' },
    { id: 'banking', label: 'Banking & Finance' },
    { id: 'tech', label: 'IT & Technology' },
    { id: 'auto', label: 'Auto & EV' },
    { id: 'energy', label: 'Oil & Energy' },
    { id: 'pharma', label: 'Pharma & Healthcare' },
    { id: 'midcap', label: 'Midcap & Growth' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 rounded-2xl font-black text-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              📰
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Indian Financial News & AI Sentiment Hub</span>
                <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                  Gemini 3.6 Flash SDK
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live market headlines aggregated from Economic Times, Moneycontrol, Livemint & Reuters India analyzed for sentiment impact.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadNews(activeCategory, true)}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live News</span>
          </button>
        </div>
      </div>

      {/* Market Sentiment Overview Header Cards */}
      {data?.sentimentSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
              Market Sentiment Gauge
            </span>
            <div className="text-xl font-black font-mono text-amber-300 mt-1">
              {data.sentimentSummary.overallLabel}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Aggregated across active market headlines</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 space-y-1">
            <span className="text-xs text-emerald-400/90 font-extrabold uppercase tracking-wider block">
              Bullish News Ratio
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {data.sentimentSummary.bullishPct}%
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {data.sentimentSummary.bullishCount} Bullish stories logged
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/20 space-y-1">
            <span className="text-xs text-rose-400/90 font-extrabold uppercase tracking-wider block">
              Bearish Warning Stories
            </span>
            <div className="text-2xl font-black font-mono text-rose-400">
              {data.sentimentSummary.bearishCount}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Downside risk catalysts tracked</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
              Neutral Updates
            </span>
            <div className="text-2xl font-black font-mono text-slate-300">
              {data.sentimentSummary.neutralCount}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Macro & regulatory announcements</p>
          </div>
        </div>
      )}

      {/* Category Filters Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs text-slate-500 font-bold flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Filter:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold font-mono transition-all shrink-0 border ${
              activeCategory === cat.id
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main News Cards Masonry Grid */}
      {loading ? (
        <div className="text-center py-20 space-y-4 glass-card rounded-3xl border border-slate-800">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-amber-400 opacity-80" />
          <div>
            <h3 className="text-lg font-bold text-slate-200">Aggregating Indian Financial Headlines & Gemini AI Sentiment...</h3>
            <p className="text-xs text-slate-400 mt-1">Parsing Economic Times, Moneycontrol, Livemint feeds with Gemini 3.6 Flash</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-rose-400 font-bold text-base">Error Loading Financial News</h3>
          <p className="text-slate-300 text-sm max-w-md mx-auto">{error}</p>
          <button
            onClick={() => loadNews(activeCategory, true)}
            className="px-4 py-2 bg-slate-900 border border-rose-500/40 text-rose-300 hover:bg-slate-800 rounded-xl text-xs font-semibold"
          >
            Retry Request
          </button>
        </div>
      ) : data?.news && data.news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.news.map((item) => (
            <div
              key={item.uuid}
              className="glass-card glass-card-hover rounded-3xl p-5 border border-slate-800/90 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                {/* Publisher & Sentiment Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-extrabold text-[11px] text-slate-300">
                      {item.publisher}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {getRelativeTime(item.providerPublishTime)}
                    </span>
                  </div>
                  {getSentimentBadge(item.sentiment)}
                </div>

                {/* Headline & Snippet */}
                <div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-extrabold text-white leading-snug hover:text-amber-300 transition-colors line-clamp-2 block"
                  >
                    {item.title}
                  </a>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {item.snippet}
                  </p>
                </div>

                {/* Gemini AI Institutional Impact Analysis Callout Box */}
                {item.impactSummary && (
                  <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3 text-xs text-amber-200/90 leading-relaxed space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Gemini 3.6 Flash Impact Analysis</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.impactSummary}</p>
                  </div>
                )}
              </div>

              {/* Related Ticker Chips & Trade Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                {item.relatedTickers && item.relatedTickers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Tickers:</span>
                    {item.relatedTickers.map((sym) => (
                      <button
                        key={sym}
                        onClick={() => openTradeModal(sym, 'BUY')}
                        className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold transition-colors flex items-center space-x-1"
                        title={`Paper Trade ${sym}`}
                      >
                        <span>{sym}</span>
                        <ShoppingCart className="w-2.5 h-2.5 text-amber-400" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.isAiAnalyzed ? 'AI Evaluated' : 'Market Signal'}
                  </span>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 text-xs font-mono"
                  >
                    <span>Read Full Story</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-3xl border border-slate-800 text-slate-500 text-xs">
          No news items found for selected category.
        </div>
      )}
    </div>
  );
};
