import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Send, RefreshCw, ChevronDown, ChevronUp, Zap, HelpCircle } from 'lucide-react';
import { RecommendationResult } from '../types';
import { sendAiChatMessage, fetchPortfolioAiInsight } from '../services/api';

interface GeminiAiInsightsCardProps {
  recommendation?: RecommendationResult | null;
  isLoading?: boolean;
}

export const GeminiAiInsightsCard: React.FC<GeminiAiInsightsCardProps> = ({ recommendation, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your **Gemini 3.6 Flash** AI Investment Assistant. Ask me anything about portfolio allocations, Indian market taxation (LTCG/STCG), RBI monetary policies, or specific stocks!',
    },
  ]);

  const [customInsights, setCustomInsights] = useState<string | null>(recommendation?.aiInsights || null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (recommendation?.aiInsights) {
      setCustomInsights(recommendation.aiInsights);
    } else if (recommendation) {
      handleFetchInsights();
    }
  }, [recommendation]);

  const handleFetchInsights = async () => {
    if (!recommendation) return;
    setIsRefreshing(true);
    try {
      const res = await fetchPortfolioAiInsight(recommendation);
      if (res.success && res.insightText) {
        setCustomInsights(res.insightText);
      }
    } catch (err) {
      console.warn('Failed to fetch AI insights:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const context = recommendation
        ? {
            investmentAmount: recommendation.investmentAmount,
            timeHorizonYears: recommendation.timeHorizonYears,
            expectedReturnPct: recommendation.expectedReturnPct,
            riskTolerance: recommendation.riskTolerance,
            realityScore: recommendation.realityScore,
            allocations: recommendation.allocations.map((a) => ({ symbol: a.symbol, weight: a.weightPct })),
          }
        : undefined;

      const res = await sendAiChatMessage(userMsg, context);

      if (res.success && res.reply) {
        setChatHistory((prev) => [...prev, { sender: 'ai', text: res.reply! }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.error || 'Gemini API is processing your request. Please ensure GEMINI_API_KEY is configured in backend/.env.',
          },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error connecting to Gemini AI backend. Please verify your server status.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const formattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
        return <h4 key={idx} className="text-emerald-400 font-bold mt-3 mb-1 text-base">{line.replace(/^#+\s*/, '')}</h4>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        const parts = line.split('**');
        return (
          <p key={idx} className="mt-2 text-slate-200 font-medium">
            {parts.map((p, i) => (i % 2 === 1 ? <strong key={i} className="text-cyan-300 font-semibold">{p}</strong> : p))}
          </p>
        );
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().replace(/^[-*]\s*/, '');
        const parts = content.split('**');
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 my-1 text-sm">
            {parts.map((p, i) => (i % 2 === 1 ? <strong key={i} className="text-amber-300 font-medium">{p}</strong> : p))}
          </li>
        );
      }
      if (!line.trim()) return <div key={idx} className="h-1" />;
      const parts = line.split('**');
      return (
        <p key={idx} className="text-slate-300 text-sm leading-relaxed my-1">
          {parts.map((p, i) => (i % 2 === 1 ? <strong key={i} className="text-emerald-300">{p}</strong> : p))}
        </p>
      );
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden mb-8">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl text-slate-950 shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">Gemini 3.6 Flash AI Portfolio Intelligence</h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> Live SDK
              </span>
            </div>
            <p className="text-xs text-slate-400">SEBI-level strategic insight & Indian market analysis</p>
          </div>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 space-y-6">
          {/* AI Analysis Container */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 md:p-5">
            {isRefreshing ? (
              <div className="py-4 flex items-center space-x-3 text-emerald-400 font-semibold text-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Generating tailored Gemini 3.6 Flash AI portfolio analysis...</span>
              </div>
            ) : customInsights ? (
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-2">
                {formattedText(customInsights)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">About Gemini 3.6 Flash AI Portfolio Assistant</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-emerald-400 font-semibold">Gemini 3.6 Flash</strong> is an advanced institutional AI intelligence engine built specifically for Indian stock market investors. It analyzes asset allocation, risk-adjusted returns, and market volatility across Nifty 50 equities, index ETFs, and sovereign gold hedges.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      🛡️ Capital Safety
                    </span>
                    <p className="text-slate-400 text-[11px] leading-tight">
                      Prioritizes low-expense Index ETFs (`NSE:NIFTYBEES`) and sovereign gold (`NSE:GOLDBEES`) to insulate capital against drawdowns.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-sky-400 flex items-center gap-1">
                      📈 Tax & Risk Assessment
                    </span>
                    <p className="text-slate-400 text-[11px] leading-tight">
                      Evaluates LTCG tax implications (12.5%) and realistic 5 to 15-year compounding CAGR for Indian markets.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      💬 Interactive AI Copilot
                    </span>
                    <p className="text-slate-400 text-[11px] leading-tight">
                      Ask questions below about SIP vs Lumpsum strategies, sector allocations, or specific NSE/BSE stocks.
                    </p>
                  </div>
                </div>

                {recommendation && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleFetchInsights}
                      disabled={isRefreshing}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Tailored AI Portfolio Report</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive AI Assistant */}
          <div className="border-t border-slate-800/80 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-slate-200">Ask Alpha-AI Assistant</h4>
              <span className="text-xs text-slate-500">(Ask about taxes, SIP vs Lumpsum, risk management)</span>
            </div>

            {/* Chat History Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 max-h-64 overflow-y-auto space-y-3 mb-3">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 text-sm ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-3.5 py-2.5 max-w-[85%] text-xs md:text-sm ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-slate-950 font-medium ml-auto'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.sender === 'ai' ? formattedText(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 items-center text-xs text-slate-400 italic py-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  Gemini 2.5 Flash is thinking...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Alpha-AI e.g. 'What is the LTCG tax on ₹1L returns?' or 'Why allocate to NIFTYBEES?'"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
