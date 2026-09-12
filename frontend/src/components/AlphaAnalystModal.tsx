import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Shield,
  TrendingUp,
  Sparkles,
  RefreshCw,
  BarChart3,
  Target,
  FileText,
  CheckCircle2,
  ChevronRight,
  Volume2,
  Play,
  Pause,
  Square,
  Lightbulb,
  Info,
  AlertTriangle,
  ShoppingCart,
  Newspaper,
} from 'lucide-react';
import { fetchAlphaAnalystReport, AlphaAnalystReportResponse } from '../services/api';
import { DownloadPdfButton } from './pdf/DownloadPdfButton';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { generateAudioBriefScript } from '../lib/audioBrief';
import { usePaperTrading } from '../context/PaperTradingContext';
import { TickerNewsDrawer } from './common/TickerNewsDrawer';



interface AlphaAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymbol?: string;
  userProfile?: {
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    timeHorizonYears?: number;
    expectedReturnPct?: number;
  };
}

export const AlphaAnalystModal: React.FC<AlphaAnalystModalProps> = ({
  isOpen,
  onClose,
  initialSymbol = 'RELIANCE',
  userProfile = { riskTolerance: 'moderate', timeHorizonYears: 3, expectedReturnPct: 14 },
}) => {
  const { openTradeModal } = usePaperTrading();
  const [symbolInput, setSymbolInput] = useState<string>(initialSymbol);
  const [activeSymbol, setActiveSymbol] = useState<string>(initialSymbol);
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AlphaAnalystReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNewsDrawerOpen, setIsNewsDrawerOpen] = useState<boolean>(false);


  const {
    speak,
    pause,
    resume,
    stop: stopSpeech,
    setRate,
    isSpeaking,
    isPaused,
    rate: currentRate,
    elapsedSeconds,
    totalDurationSeconds,
    isSupported: isSpeechSupported,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (isOpen && initialSymbol) {
      setSymbolInput(initialSymbol);
      setActiveSymbol(initialSymbol);
      loadReport(initialSymbol);
    } else if (!isOpen) {
      stopSpeech();
    }
  }, [isOpen, initialSymbol]);

  const handleClose = () => {
    stopSpeech();
    onClose();
  };

  const loadReport = async (sym: string) => {
    stopSpeech();
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlphaAnalystReport(sym, userProfile);
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load Goldman Sachs report', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate Goldman Sachs research report');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAudioBrief = () => {
    if (!report) return;
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      const script = generateAudioBriefScript(report);
      speak(script);
    }
  };

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolInput.trim()) return;
    const clean = symbolInput.trim().toUpperCase().replace('NSE:', '').replace('.NS', '');
    setActiveSymbol(clean);
    loadReport(clean);
  };

  // Structured Block Markdown Parsing for GitHub Callouts, Thesis Cards & Institutional Formatting
  const renderMarkdown = (text: string) => {
    const rawLines = text.split('\n');
    const blocks: Array<{ type: string; lines: string[] }> = [];

    let currentType: string | null = null;
    let currentLines: string[] = [];

    const flushBlock = () => {
      if (currentLines.length > 0 && currentType) {
        blocks.push({ type: currentType, lines: [...currentLines] });
        currentLines = [];
        currentType = null;
      }
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        flushBlock();
        continue;
      }

      if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        flushBlock();
        blocks.push({ type: 'header', lines: [trimmed] });
      } else if (trimmed.startsWith('>')) {
        if (currentType !== 'quote') {
          flushBlock();
          currentType = 'quote';
        }
        currentLines.push(trimmed);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentType !== 'unordered_list') {
          flushBlock();
          currentType = 'unordered_list';
        }
        currentLines.push(trimmed);
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (currentType !== 'ordered_list') {
          flushBlock();
          currentType = 'ordered_list';
        }
        currentLines.push(trimmed);
      } else {
        if (currentType !== 'paragraph') {
          flushBlock();
          currentType = 'paragraph';
        }
        currentLines.push(trimmed);
      }
    }
    flushBlock();

    return blocks.map((block, bIdx) => {
      if (block.type === 'header') {
        const line = block.lines[0];
        if (line.startsWith('# ')) {
          return (
            <div key={bIdx} className="my-5 p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-400 rounded-r-2xl shadow-sm">
              <h1 className="text-xl md:text-2xl font-black text-amber-300 tracking-wide font-mono flex items-center gap-2">
                {line.replace(/^#\s*/, '')}
              </h1>
            </div>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={bIdx} className="text-base md:text-lg font-extrabold text-white mt-6 mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
              {line.replace(/^##\s*/, '')}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={bIdx} className="text-sm md:text-base font-bold text-amber-400 mt-5 mb-2.5 flex items-center gap-2">
              {line.replace(/^###\s*/, '')}
            </h3>
          );
        }
      }

      if (block.type === 'quote') {
        const fullQuoteText = block.lines.map((l) => l.replace(/^>\s*/, '')).join(' ');
        const isAlert = fullQuoteText.includes('[!NOTE]') || fullQuoteText.includes('[!IMPORTANT]') || fullQuoteText.includes('[!TIP]') || fullQuoteText.includes('[!WARNING]');

        if (isAlert) {
          const cleanContent = fullQuoteText.replace(/\[!(NOTE|IMPORTANT|TIP|WARNING)\]/g, '').trim();
          return (
            <div key={bIdx} className="my-4 p-4.5 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-l-4 border-amber-400 rounded-r-2xl text-amber-200 text-xs md:text-sm font-medium leading-relaxed shadow-md flex items-start gap-3 border-y border-r border-amber-500/20">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-amber-300 text-xs uppercase tracking-wider block mb-1">
                  Executive Research Disclosure
                </span>
                <p className="text-amber-200/90 text-xs md:text-sm leading-relaxed">
                  {cleanContent.replace(/\*\*/g, '').replace(/^\*\s*/, '')}
                </p>
              </div>
            </div>
          );
        }

        return (
          <blockquote key={bIdx} className="my-4 p-4 bg-slate-900/90 border-l-4 border-emerald-500 rounded-r-2xl italic text-slate-300 text-xs md:text-sm leading-relaxed shadow-sm border-y border-r border-slate-800">
            {fullQuoteText.replace(/\*\*/g, '')}
          </blockquote>
        );
      }

      if (block.type === 'unordered_list') {
        return (
          <ul key={bIdx} className="space-y-2 my-3">
            {block.lines.map((line, lIdx) => {
              const content = line.replace(/^[-*]\s*/, '');
              const parts = content.split('**');
              return (
                <li key={lIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/70 hover:border-slate-700 transition-colors">
                  <span className="text-amber-400 font-extrabold mt-0.5">•</span>
                  <span className="flex-1">
                    {parts.map((p, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="text-cyan-300 font-semibold">
                          {p}
                        </strong>
                      ) : (
                        p
                      )
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }

      if (block.type === 'ordered_list') {
        return (
          <div key={bIdx} className="space-y-3 my-4">
            {block.lines.map((line, lIdx) => {
              const numMatch = line.match(/^(\d+)\.\s*(.*)/);
              const num = numMatch ? numMatch[1] : lIdx + 1;
              const content = numMatch ? numMatch[2] : line;
              const parts = content.split('**');

              return (
                <div key={lIdx} className="p-4 bg-slate-900/80 border border-slate-800/90 rounded-2xl text-xs md:text-sm leading-relaxed text-slate-200 shadow-sm flex items-start gap-3 hover:border-slate-700/80 transition-colors">
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-black font-mono shrink-0">
                    {num}
                  </span>
                  <div className="flex-1">
                    {parts.map((p, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="text-amber-300 font-bold block mb-1 text-xs md:text-sm">
                          {p}
                        </strong>
                      ) : (
                        <span key={i} className="text-slate-300">{p}</span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // Standard Paragraphs
      return (
        <div key={bIdx} className="space-y-2 my-2">
          {block.lines.map((line, lIdx) => {
            const parts = line.split('**');
            return (
              <p key={lIdx} className="text-slate-300 text-xs md:text-sm leading-relaxed">
                {parts.map((p, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="text-emerald-300 font-semibold">
                      {p}
                    </strong>
                  ) : (
                    p
                  )
                )}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const getRatingBadgeStyle = (rating: string) => {
    const lower = rating.toLowerCase();
    if (lower.includes('strong buy') || lower.includes('buy')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (lower.includes('hold')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-950 border border-amber-500/30 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/20 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left Title Block */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 rounded-2xl font-black text-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              🏛️
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md shadow-sm">
                  Goldman Sachs Style Research
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  Gemini 3.6 Flash SDK
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight leading-tight">
                Alpha Analyst Institutional Research
              </h2>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            {report && !loading && (
              <>
                <button
                  onClick={() => setIsNewsDrawerOpen(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30"
                  title={`View Live News Stream for ${activeSymbol}`}
                >
                  <Newspaper className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Stock News</span>
                </button>

                <button
                  onClick={() => openTradeModal(activeSymbol, 'BUY', report.currentPrice, report.companyName)}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border shadow-md bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                  title={`Execute Paper Trade order for ${activeSymbol}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Trade {activeSymbol}</span>
                </button>


                <button
                  onClick={handleToggleAudioBrief}
                  disabled={!isSpeechSupported}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-md ${
                    isSpeaking
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/50'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                  title="Listen to 60-second AI Voice Executive Briefing"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking && !isPaused ? 'animate-pulse text-slate-950 font-bold' : 'text-amber-400'}`} />
                  <span className="hidden sm:inline">
                    {isSpeaking ? (isPaused ? 'Resume Briefing' : 'Briefing (60s)') : 'Listen to Briefing (60s)'}
                  </span>
                  <span className="sm:hidden">{isSpeaking ? 'Briefing' : 'Audio (60s)'}</span>
                </button>

                <DownloadPdfButton report={report} />
              </>
            )}

            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all shadow-sm"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Voice Audio Player Card */}
        {(isSpeaking || isPaused) && (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-b border-amber-500/30 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-inner shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                    AI Voice Executive Briefing
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {isPaused ? 'PAUSED' : 'LIVE SPEECH'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {activeSymbol} Institutional Research • {elapsedSeconds}s / {totalDurationSeconds}s
                </p>
              </div>
            </div>

            {/* Controls & Speed Selector */}
            <div className="flex items-center gap-3">
              {/* Animated Equalizer Wave Bar */}
              <div className="flex items-end gap-1 h-4 px-2">
                {[0.4, 0.9, 0.6, 1.0, 0.5].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isSpeaking && !isPaused ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'
                    }`}
                    style={{ height: isSpeaking && !isPaused ? `${h * 100}%` : '25%' }}
                  />
                ))}
              </div>

              {/* Play / Pause Toggle */}
              <button
                onClick={isPaused ? resume : pause}
                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4 fill-slate-950" />}
              </button>

              {/* Stop Button */}
              <button
                onClick={stopSpeech}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                title="Stop Audio Briefing"
              >
                <Square className="w-4 h-4" />
              </button>

              {/* Rate Selector Pills */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-[11px]">
                {[1.0, 1.25, 1.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                      currentRate === r
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ticker Search Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Enter NSE Symbol e.g. RELIANCE, TCS, HDFCBANK, TATAMOTORS..."
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shrink-0"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Analyze Ticker</span>
            </button>
          </form>

          {/* Quick Popular Ticker Shortcuts */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500">Popular:</span>
            {['RELIANCE', 'TCS', 'HDFCBANK', 'TATAMOTORS', 'INFY'].map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  setSymbolInput(sym);
                  setActiveSymbol(sym);
                  loadReport(sym);
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                  activeSymbol === sym
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {loading ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">Generating Goldman Sachs Equity Research Report...</h3>
                <p className="text-xs text-slate-400 mt-1">Aggregating telemetry for <code className="text-amber-400">{activeSymbol}</code>, computing RSI, Quant metrics, & invoking Gemini 3.6 Flash</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center space-y-3">
              <h3 className="text-rose-400 font-bold text-base">Error Generating Research Report</h3>
              <p className="text-slate-300 text-sm">{error}</p>
              <button
                onClick={() => loadReport(activeSymbol)}
                className="px-4 py-2 bg-slate-900 border border-rose-500/40 text-rose-300 hover:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Retry Request
              </button>
            </div>
          ) : report ? (
            <>
              {/* Quick Telemetry Stats Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {/* Current Price */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Current Price</span>
                  <div className="text-xl font-black font-mono text-white mt-1.5">
                    ₹{report.currentPrice?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block truncate font-medium">{report.companyName}</span>
                </div>

                {/* Quant Rating */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Quant Rating</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-sm font-extrabold flex items-center gap-1 ${getRatingBadgeStyle(report.quantMetrics.rating)}`}>
                      <Award className="w-4 h-4" />
                      <span>{report.quantMetrics.rating}</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1.5 block font-mono font-medium">Score: {report.quantMetrics.totalScore}/100</span>
                </div>

                {/* 14-Day RSI */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">14-Day RSI</span>
                  <div className="text-xl font-black font-mono text-cyan-400 mt-1.5">
                    {report.technicals.rsi}
                  </div>
                  <span className="text-[11px] text-cyan-300/80 mt-1 block truncate font-medium">{report.technicals.rsiSignal}</span>
                </div>

                {/* 50D / 200D Trend */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">50D / 200D Trend</span>
                  <div className="text-xs font-extrabold text-emerald-400 mt-2 truncate">
                    {report.technicals.maTrend}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block font-mono">50D: ₹{report.technicals.fiftyDayAverage}</span>
                </div>
              </div>

              {/* Quant Score Factor Breakdown Sub-Cards */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>Quant Score Breakdown</span>
                  </h4>
                  <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Total: {report.quantMetrics.totalScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {/* Value */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-300">Value</span>
                      <span className="text-amber-400 font-mono">{report.quantMetrics.valueScore}/25</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${(report.quantMetrics.valueScore / 25) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {report.quantMetrics.valueScore >= 18 ? 'Attractive Valuation' : 'Fair Valuation'}
                    </span>
                  </div>

                  {/* Growth */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-300">Growth</span>
                      <span className="text-emerald-400 font-mono">{report.quantMetrics.growthScore}/25</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${(report.quantMetrics.growthScore / 25) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {report.quantMetrics.growthScore >= 18 ? 'Strong Revenue Expansion' : 'Moderate Growth'}
                    </span>
                  </div>

                  {/* Momentum */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-300">Momentum</span>
                      <span className="text-cyan-400 font-mono">{report.quantMetrics.momentumScore}/25</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${(report.quantMetrics.momentumScore / 25) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {report.quantMetrics.momentumScore >= 18 ? 'Bullish Moving Averages' : 'Neutral Trend'}
                    </span>
                  </div>

                  {/* Quality */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-300">Quality</span>
                      <span className="text-purple-400 font-mono">{report.quantMetrics.qualityScore}/25</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-purple-400 h-full rounded-full transition-all duration-500" style={{ width: `${(report.quantMetrics.qualityScore / 25) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {report.quantMetrics.qualityScore >= 18 ? 'Robust Balance Sheet' : 'Average Financials'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Markdown Report Render Container */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-7 space-y-4 shadow-xl">
                {renderMarkdown(report.reportMarkdown)}
              </div>

              {/* Bottom Action Footer with PDF Export Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-2xl gap-3 shadow-md">
                <div className="text-xs text-slate-400 text-center sm:text-left">
                  <span className="text-amber-400 font-extrabold">Goldman Sachs Style Research:</span> Formatted with multi-page institutional disclosures & SEBI compliance notes.
                </div>
                <DownloadPdfButton report={report} />
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Ticker Specific Live News & Gemini Sentiment Drawer */}
      <TickerNewsDrawer
        symbol={activeSymbol}
        isOpen={isNewsDrawerOpen}
        onClose={() => setIsNewsDrawerOpen(false)}
      />
    </div>
  );
};


