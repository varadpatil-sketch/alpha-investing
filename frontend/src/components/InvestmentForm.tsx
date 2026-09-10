import React, { useState } from 'react';
import { IndianRupee, Clock, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

interface InvestmentFormProps {
  onGenerate: (params: {
    investmentAmount: number;
    timeHorizonYears: number;
    expectedReturnPct: number;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  }) => void;
  isLoading: boolean;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ onGenerate, isLoading }) => {
  const [amount, setAmount] = useState<number>(100000);
  const [horizon, setHorizon] = useState<number>(5);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [risk, setRisk] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      investmentAmount: amount,
      timeHorizonYears: horizon,
      expectedReturnPct: expectedReturn,
      riskTolerance: risk,
    });
  };

  const presetAmounts = [25000, 50000, 100000, 500000, 1000000];

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl shadow-slate-950/50">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Investment Profile & Goals</h2>
          <p className="text-xs text-slate-400">Define your budget, target timeline, and return expectations</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Investment Amount */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
              <span>Total Investment Capital</span>
            </label>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              ₹ {amount.toLocaleString('en-IN')}
            </span>
          </div>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(5000, Number(e.target.value)))}
            step={5000}
            min={5000}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  amount === preset
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ₹{(preset / 1000).toLocaleString('en-IN')}k
              </button>
            ))}
          </div>
        </div>

        {/* Time Horizon Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              <span>Investment Time Horizon</span>
            </label>
            <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
              {horizon} {horizon === 1 ? 'Year' : 'Years'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>1 Year (Short)</span>
            <span>5 Years (Balanced)</span>
            <span>15 Years (Long)</span>
          </div>
        </div>

        {/* Expected Return Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              <span>Target Annual Return (p.a.)</span>
            </label>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              {expectedReturn}% p.a.
            </span>
          </div>
          <input
            type="range"
            min={6}
            max={25}
            step={0.5}
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>6% (Fixed Deposit)</span>
            <span>12% (Index Avg)</span>
            <span>25%+ (Aggressive)</span>
          </div>
        </div>

        {/* Risk Profile Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 mb-2">
            <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
            <span>Risk Tolerance</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'conservative', label: 'Conservative', desc: 'Focus on Capital Safety & Low Volatility' },
              { id: 'moderate', label: 'Moderate', desc: 'Balanced Growth & Bluechip Equity' },
              { id: 'aggressive', label: 'Aggressive', desc: 'High CAGR & Mid-Cap Growth Focus' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRisk(item.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  risk === item.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-white">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing Indian Market Data...</span>
            </div>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Safe Recommended Portfolio</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
