import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Lightbulb } from 'lucide-react';
import { RecommendationResult } from '../types';

interface RealityCheckBannerProps {
  recommendation: RecommendationResult;
}

export const RealityCheckBanner: React.FC<RealityCheckBannerProps> = ({ recommendation }) => {
  const { realityScore, realityTitle, realityMessage, suggestedReturnPct, expectedReturnPct } = recommendation;

  if (realityScore === 'realistic') {
    return (
      <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-5 flex items-start space-x-4 shadow-lg shadow-emerald-950/40">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-emerald-300 flex items-center space-x-2">
              <span>{realityTitle}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Safe & Feasible
              </span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">Target: {expectedReturnPct}% p.a.</span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{realityMessage}</p>
        </div>
      </div>
    );
  }

  if (realityScore === 'moderate_risk') {
    return (
      <div className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-5 flex items-start space-x-4 shadow-lg shadow-amber-950/40">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-amber-300 flex items-center space-x-2">
              <span>{realityTitle}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Higher Volatility Required
              </span>
            </h3>
            <span className="text-xs font-mono text-amber-400 font-bold">Suggested: {suggestedReturnPct}% p.a.</span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{realityMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-rose-950/40 border border-rose-500/30 p-5 flex items-start space-x-4 shadow-lg shadow-rose-950/40 animate-pulse-slow">
      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-rose-300 flex items-center space-x-2">
            <span>{realityTitle}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              High Risk Mismatch
            </span>
          </h3>
          <span className="text-xs font-mono text-rose-400 font-bold">Safe Benchmark: ~{suggestedReturnPct}% p.a.</span>
        </div>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{realityMessage}</p>
        <div className="mt-3 flex items-center space-x-2 text-[11px] text-rose-200/90 font-medium bg-rose-900/30 p-2 rounded-lg border border-rose-800/40">
          <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Tip: Alpha Investing has adjusted allocations to balance capital protection while striving for optimal returns.</span>
        </div>
      </div>
    </div>
  );
};
