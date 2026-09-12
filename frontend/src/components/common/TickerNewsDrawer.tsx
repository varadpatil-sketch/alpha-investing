import React, { useEffect, useState } from 'react';
import { X, Newspaper, TrendingUp, TrendingDown, RefreshCw, ExternalLink, Sparkles, ShoppingCart, ShieldCheck } from 'lucide-react';
import { fetchTickerNews, TickerNewsResponse, NewsItem } from '../../services/api';
import { usePaperTrading } from '../../context/PaperTradingContext';

interface TickerNewsDrawerProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TickerNewsDrawer: React.FC<TickerNewsDrawerProps> = ({ symbol, isOpen, onClose }) => {
  const { openTradeModal } = usePaperTrading();
  const [data, setData] = useState<TickerNewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && symbol) {
      loadTickerNews(symbol);
    }
  }, [isOpen, symbol]);

  const loadTickerNews = async (sym: string, refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTickerNews(sym, refresh);
      setData(res);
    } catch (err: any) {
      console.error(`Failed to load news for ${sym}:`, err);
      setError(err.message || 'Failed to fetch live stock news');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cleanSym = symbol.toUpperCase().replace('NSE:', '').replace('.NS', '');

  const getSentimentBadge = (sentiment: string) => {
    if (sentiment === 'BULLISH') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>Bullish</span>
        </span>
      );
    }
    if (sentiment === 'BEARISH') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-rose-400" />
          <span>Bearish</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-800 text-slate-400 border border-slate-700">
        Neutral
      </span>
    );
  };

  const getRelativeTime = (isoTime: string) => {
    try {
      const diffMs = Date.now() - new Date(isoTime).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-white font-mono tracking-wide">{cleanSym}</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Live News & Sentiment
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-time Indian financial news stream</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadTickerNews(cleanSym, true)}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            title="Refresh Live Stock News"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI Sentiment Summary Banner */}
      {data?.sentimentSummary && (
        <div className="bg-slate-900/90 border-b border-slate-800 p-3.5 px-5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-slate-300 font-bold">Gemini Sentiment:</span>
            <span className="text-amber-300 font-black">{data.sentimentSummary.overallLabel}</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-emerald-400 font-bold">🟢 {data.sentimentSummary.bullishCount}</span>
            <span className="text-rose-400 font-bold">🔴 {data.sentimentSummary.bearishCount}</span>
          </div>
        </div>
      )}

      {/* News Stream Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 opacity-80" />
            <p className="text-xs text-slate-300 font-bold">Fetching live market news & analyzing AI sentiment for {cleanSym}...</p>
            <p className="text-[11px] text-slate-500 font-mono">Invoking Gemini 3.6 Flash Sentiment Engine</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-center space-y-2">
            <p className="text-rose-400 font-bold text-xs">Error Loading Stock News</p>
            <p className="text-slate-400 text-xs">{error}</p>
            <button
              onClick={() => loadTickerNews(cleanSym, true)}
              className="px-3 py-1.5 bg-slate-900 text-xs text-rose-300 border border-rose-500/40 rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : data?.news && data.news.length > 0 ? (
          data.news.map((item) => (
            <div
              key={item.uuid}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition-colors"
            >
              {/* Publisher & Timestamp */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-300">{item.publisher}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-mono">{getRelativeTime(item.providerPublishTime)}</span>
                </div>
                {getSentimentBadge(item.sentiment)}
              </div>

              {/* Title & Snippet */}
              <div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-white text-xs md:text-sm leading-snug hover:text-amber-300 transition-colors line-clamp-2 block"
                >
                  {item.title}
                </a>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                  {item.snippet}
                </p>
              </div>

              {/* Gemini AI Impact Insight */}
              {item.impactSummary && (
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-amber-200/90 leading-relaxed flex items-start space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.impactSummary}</span>
                </div>
              )}

              {/* Trade Action & Read Full Article */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <button
                  onClick={() => openTradeModal(cleanSym, 'BUY')}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all flex items-center space-x-1 shadow-sm"
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>Trade {cleanSym}</span>
                </button>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white inline-flex items-center space-x-1 font-mono"
                >
                  <span>Read Article</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No active news stories found for {cleanSym}
          </div>
        )}
      </div>
    </div>
  );
};
