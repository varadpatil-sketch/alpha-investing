import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { InvestmentForm } from './components/InvestmentForm';
import { RealityCheckBanner } from './components/RealityCheckBanner';
import { AllocationChart } from './components/AllocationChart';
import { StockCard } from './components/StockCard';
import { ProjectionChart } from './components/ProjectionChart';
import { BacktestTable } from './components/BacktestTable';
import { StockScreener } from './components/StockScreener';
import { TradingTerminal } from './components/terminal/TradingTerminal';
import { KitePayloadModal } from './components/KitePayloadModal';
import { AuthModal } from './components/AuthModal';
import { SavedPortfoliosModal } from './components/SavedPortfoliosModal';
import { generateRecommendation, savePortfolio } from './services/api';
import { AllocationItem, RecommendationResult, UserProfile } from './types';
import { BookmarkCheck, Shield, Sparkles, TrendingUp, HelpCircle, RefreshCw, BarChart2, CandlestickChart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'screener' | 'terminal'>('recommendations');
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSavedOpen, setIsSavedOpen] = useState<boolean>(false);
  const [isKiteOpen, setIsKiteOpen] = useState<boolean>(false);
  const [inspectStock, setInspectStock] = useState<AllocationItem | null>(null);

  // Save feedback state
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Last user input state for 15-minute background auto-refresh
  const [lastParams, setLastParams] = useState<{
    investmentAmount: number;
    timeHorizonYears: number;
    expectedReturnPct: number;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  }>({
    investmentAmount: 100000,
    timeHorizonYears: 5,
    expectedReturnPct: 12,
    riskTolerance: 'moderate',
  });

  const handleGenerate = async (params: {
    investmentAmount: number;
    timeHorizonYears: number;
    expectedReturnPct: number;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  }) => {
    setIsLoading(true);
    setSaveSuccess(false);
    setLastParams(params);
    try {
      const res = await generateRecommendation(params);
      setRecommendation(res);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to generate recommendation', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate(lastParams);

    const interval = setInterval(() => {
      console.log('⏰ 15-Minute Auto-Refresh Triggered: Querying Yahoo Finance API...');
      handleGenerate(lastParams);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickDemoLogin = () => {
    const demoUser: UserProfile = {
      id: 'demo_user_101',
      name: 'Demo Investor',
      email: 'investor@alphainvesting.in',
      riskTolerance: 'moderate',
    };
    localStorage.setItem('alpha_token', 'demo_jwt_token_2026');
    setUser(demoUser);
  };

  const handleSaveCurrentPortfolio = async () => {
    if (!recommendation) return;
    try {
      await savePortfolio({
        title: `Portfolio ₹${(recommendation.investmentAmount / 1000).toFixed(0)}k (${recommendation.timeHorizonYears}Yrs)`,
        investmentAmount: recommendation.investmentAmount,
        timeHorizonYears: recommendation.timeHorizonYears,
        expectedReturnPct: recommendation.expectedReturnPct,
        riskTolerance: recommendation.riskTolerance,
        realityScore: recommendation.realityScore,
        realityMessage: recommendation.realityMessage,
        allocations: recommendation.allocations,
        projectedValue5Yr: recommendation.projectedValue5Yr,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save portfolio', err);
    }
  };

  const handleInspectStock = (stock: AllocationItem | string) => {
    if (typeof stock === 'string') {
      const found = recommendation?.allocations.find((a) => a.symbol === stock);
      if (found) {
        setInspectStock(found);
      } else {
        setInspectStock({
          symbol: stock,
          name: stock,
          exchange: 'NSE',
          instrumentToken: 999999,
          weightPct: 0,
          allocatedAmount: 0,
          sector: 'Equities',
          assetClass: 'Large Cap Stock',
          riskRating: 'Moderate',
          expectedCagr: 14,
          description: 'Live NSE ticker payload',
          lastPrice: 0,
        });
      }
    } else {
      setInspectStock(stock);
    }
    setIsKiteOpen(true);
  };

  const handleInspectFullPortfolio = () => {
    setInspectStock(null);
    setIsKiteOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Navigation with Tab Switcher */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          localStorage.removeItem('alpha_token');
          setUser(null);
        }}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenKiteModal={handleInspectFullPortfolio}
        onQuickDemoLogin={handleQuickDemoLogin}
      />

      {/* Mobile Tab Switcher Bar */}
      <div className="flex lg:hidden items-center justify-center p-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full max-w-sm">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab('screener')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'screener'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Screener</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'terminal'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CandlestickChart className="h-3.5 w-3.5" />
            <span>Terminal</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'terminal' ? (
          /* TAB 3: PRO TRADINGVIEW TERMINAL */
          <TradingTerminal />
        ) : activeTab === 'screener' ? (
          /* TAB 2: LIVE STOCK SCREENER DASHBOARD */
          <StockScreener onInspectKite={handleInspectStock} />
        ) : (
          /* TAB 1: PORTFOLIO RECOMMENDATIONS DASHBOARD */
          <>
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 p-8 shadow-2xl">
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Smart Capital Protection & Diversified Equity Allocation</span>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-semibold">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Yahoo API Auto Refresh: Every 15 Mins</span>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Invest Safely in Indian Markets with Data-Driven Clarity
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Define your budget, target timeline, and return expectations. **Alpha Investing** automatically calculates a risk-evaluated portfolio across Nifty 50 index ETFs, blue-chip leaders, and gold hedges.
                </p>
              </div>
            </div>

            {/* Form and Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Investment Form */}
              <div className="lg:col-span-5 space-y-6">
                <InvestmentForm onGenerate={handleGenerate} isLoading={isLoading} />

                {/* Quick Safety Disclaimer Card */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-slate-200 font-bold">
                    <HelpCircle className="h-4 w-4 text-emerald-400" />
                    <span>How Alpha Investing keeps your money safe</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    By prioritizing Nifty 50 Index ETFs (`NSE:NIFTYBEES`) and sovereign gold instruments (`NSE:GOLDBEES`), your core capital remains insulated from single-company insolvencies while participating in India's macroeconomic growth.
                  </p>
                </div>
              </div>

              {/* Right Column: Portfolio Dashboard */}
              <div className="lg:col-span-7 space-y-6">
                {recommendation && (
                  <>
                    {/* 1. Reality Check Feasibility Banner */}
                    <RealityCheckBanner recommendation={recommendation} />

                    {/* 2. Top Summary Metrics Header */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="glass-card rounded-xl p-3.5 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Capital</span>
                        <div className="text-sm font-extrabold font-mono text-white">
                          ₹{recommendation.investmentAmount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="glass-card rounded-xl p-3.5 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Timeline</span>
                        <div className="text-sm font-extrabold text-sky-400 font-mono">
                          {recommendation.timeHorizonYears} Years
                        </div>
                      </div>

                      <div className="glass-card rounded-xl p-3.5 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Safe CAGR</span>
                        <div className="text-sm font-extrabold text-emerald-400 font-mono">
                          {recommendation.suggestedReturnPct}% p.a.
                        </div>
                      </div>

                      <div className="glass-card rounded-xl p-3.5 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">5Yr Projection</span>
                        <div className="text-sm font-extrabold text-amber-400 font-mono">
                          ₹{(recommendation.projectedValue5Yr / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </div>

                    {/* 3. Action Bar (Save Portfolio & Auto-Refresh Indicator) */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        <h3 className="font-extrabold text-base text-white">Recommended Allocation</h3>
                        {lastRefreshed && (
                          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                            (Refreshed: {lastRefreshed})
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleSaveCurrentPortfolio}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                          saveSuccess
                            ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {saveSuccess ? (
                          <>
                            <BookmarkCheck className="h-4 w-4" />
                            <span>Saved to My Scenarios!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkCheck className="h-4 w-4 text-amber-400" />
                            <span>Save Portfolio Scenario</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 4. Asset Class Donut Chart */}
                    <AllocationChart
                      allocations={recommendation.allocations}
                      totalAmount={recommendation.investmentAmount}
                    />

                    {/* 5. Recommended Stock & ETF Cards */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Stock & ETF Breakdown ({recommendation.allocations.length} Holdings)
                        </h4>
                        <span className="text-[11px] text-slate-500">Click "Kite JSON" on any ticker to inspect response format</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recommendation.allocations.map((item) => (
                          <StockCard key={item.symbol} item={item} onInspectKite={handleInspectStock} />
                        ))}
                      </div>
                    </div>

                    {/* 6. Multi-Year Compounding Projection Line Chart */}
                    <ProjectionChart recommendation={recommendation} />

                    {/* 7. Historical Backtest Simulation */}
                    <BacktestTable recommendation={recommendation} />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-slate-400">Alpha Investing © 2026</span>
            <span>— Indian Stock Market Recommendation System</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Automated 15-Minute Yahoo Finance Realtime API Reloading (.NS)
          </div>
        </div>
      </footer>

      {/* Modals */}
      <KitePayloadModal
        isOpen={isKiteOpen}
        onClose={() => setIsKiteOpen(false)}
        selectedStock={inspectStock}
        portfolioAllocations={recommendation?.allocations}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      <SavedPortfoliosModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        onSelectPortfolio={(saved) => {
          setRecommendation({
            investmentAmount: saved.investmentAmount,
            timeHorizonYears: saved.timeHorizonYears,
            expectedReturnPct: saved.expectedReturnPct,
            riskTolerance: saved.riskTolerance as any,
            realityScore: saved.realityScore as any,
            realityTitle: 'Saved Portfolio Scenario',
            realityMessage: saved.realityMessage,
            suggestedReturnPct: saved.expectedReturnPct,
            allocations: saved.allocations,
            projectedValue1Yr: Math.round(saved.investmentAmount * 1.12),
            projectedValue3Yr: Math.round(saved.investmentAmount * 1.4),
            projectedValue5Yr: saved.projectedValue5Yr,
            projectedValue10Yr: Math.round(saved.investmentAmount * 3.1),
            backtestPerformance: [
              { year: '2020', portfolioReturn: 16.2, nifty50Return: 14.9 },
              { year: '2021', portfolioReturn: 26.5, nifty50Return: 24.1 },
              { year: '2022', portfolioReturn: 7.8, nifty50Return: 4.3 },
              { year: '2023', portfolioReturn: 22.4, nifty50Return: 20.0 },
              { year: '2024', portfolioReturn: 18.9, nifty50Return: 16.5 },
            ],
          });
        }}
      />
    </div>
  );
}
