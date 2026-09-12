import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AllocationItem } from '../types';
import { PieChart as PieIcon } from 'lucide-react';
import { ChartSkeleton } from './common/SkeletonLoaders';

interface AllocationChartProps {
  allocations: AllocationItem[];
  totalAmount: number;
  isLoading?: boolean;
}

const COLORS: Record<string, string> = {
  'Index ETF': '#10b981', // emerald
  'Large Cap Stock': '#38bdf8', // sky
  'Mid Cap Stock': '#f59e0b', // amber
  'Dividend Stock': '#a855f7', // purple
  'Debt & Gold ETF': '#ec4899', // pink
};

export const AllocationChart: React.FC<AllocationChartProps> = ({ allocations, totalAmount, isLoading }) => {
  if (isLoading) {
    return <ChartSkeleton title="Calculating Asset Class Diversification..." height="h-80" />;
  }
  // Group by Asset Class
  const groupMap: Record<string, number> = {};
  allocations.forEach((a) => {
    groupMap[a.assetClass] = (groupMap[a.assetClass] || 0) + a.weightPct;
  });

  const chartData = Object.entries(groupMap).map(([assetClass, weightPct]) => ({
    name: assetClass,
    value: Math.round(weightPct * 10) / 10,
    amount: Math.round((totalAmount * weightPct) / 100),
    color: COLORS[assetClass] || '#64748b',
  }));

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <PieIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Asset Class Allocation</h3>
            <p className="text-xs text-slate-400">Diversification strategy across Indian equity & debt</p>
          </div>
        </div>
      </div>

      <div className="h-56 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 shadow-xl text-xs font-sans">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }}></span>
                        <span>{data.name}</span>
                      </div>
                      <div className="text-slate-300 mt-1">
                        Weight: <span className="font-bold text-emerald-400">{data.value}%</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        Amount: ₹{data.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute text-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
          <div className="text-sm font-extrabold font-mono text-white">₹{totalAmount.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/60">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900/50">
            <div className="flex items-center space-x-2 truncate">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="text-slate-300 truncate text-[11px] font-medium">{item.name}</span>
            </div>
            <span className="font-bold font-mono text-emerald-400 ml-2">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
