import React from 'react';
import { RecommendationResult } from '../types';
import { History, Award } from 'lucide-react';

interface BacktestTableProps {
  recommendation: RecommendationResult;
}

export const BacktestTable: React.FC<BacktestTableProps> = ({ recommendation }) => {
  const { backtestPerformance } = recommendation;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <History className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Historical Backtest Simulation</h3>
            <p className="text-xs text-slate-400">Past performance of this strategy vs Nifty 50 benchmark</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 font-medium">
          <Award className="h-3.5 w-3.5 text-emerald-400" />
          <span>Outperformed Nifty 50 in 4 out of 5 years</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="pb-3 px-3">Year</th>
              <th className="pb-3 px-3">Alpha Investing Portfolio</th>
              <th className="pb-3 px-3">Nifty 50 Index</th>
              <th className="pb-3 px-3">Alpha Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {backtestPerformance.map((row) => {
              const alpha = Math.round((row.portfolioReturn - row.nifty50Return) * 10) / 10;
              return (
                <tr key={row.year} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{row.year}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-400">+{row.portfolioReturn}%</td>
                  <td className="py-3 px-3 text-sky-400 font-semibold">+{row.nifty50Return}%</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      +{alpha}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
