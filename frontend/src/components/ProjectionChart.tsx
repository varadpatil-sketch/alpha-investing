import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RecommendationResult } from '../types';
import { TrendingUp, LineChart as LineIcon } from 'lucide-react';

interface ProjectionChartProps {
  recommendation: RecommendationResult;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ recommendation }) => {
  const {
    investmentAmount,
    projectedValue1Yr,
    projectedValue3Yr,
    projectedValue5Yr,
    projectedValue10Yr,
    suggestedReturnPct,
  } = recommendation;

  const chartData = [
    { year: 'Start (Yr 0)', amount: investmentAmount, projected: investmentAmount },
    { year: 'Year 1', amount: investmentAmount, projected: projectedValue1Yr },
    { year: 'Year 3', amount: investmentAmount, projected: projectedValue3Yr },
    { year: 'Year 5', amount: investmentAmount, projected: projectedValue5Yr },
    { year: 'Year 10', amount: investmentAmount, projected: projectedValue10Yr },
  ];

  const netGain10Yr = projectedValue10Yr - investmentAmount;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <LineIcon className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Compounding Growth Projection</h3>
            <p className="text-xs text-slate-400">
              Estimated wealth accumulation at <span className="text-emerald-400 font-bold">{suggestedReturnPct}% p.a.</span> CAGR
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-400">10-Yr Projected Gain:</span>
          <span className="font-extrabold font-mono text-emerald-400">+₹{netGain10Yr.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  const profit = val - investmentAmount;
                  return (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs font-sans">
                      <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1.5">{label}</div>
                      <div className="text-white">
                        Value: <span className="font-extrabold text-emerald-400 font-mono">₹{val.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Net Returns: <span className="text-emerald-400 font-mono font-bold">+₹{profit.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="projected" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#growthGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
        {[
          { label: 'Year 1', val: projectedValue1Yr },
          { label: 'Year 3', val: projectedValue3Yr },
          { label: 'Year 5', val: projectedValue5Yr },
          { label: 'Year 10', val: projectedValue10Yr },
        ].map((item) => (
          <div key={item.label} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block font-medium">{item.label}</span>
            <span className="text-xs font-extrabold font-mono text-emerald-400">₹{(item.val / 1000).toFixed(0)}k</span>
          </div>
        ))}
      </div>
    </div>
  );
};
