import React from 'react';

export const ChartSkeleton: React.FC<{ height?: string; title?: string }> = ({
  height = 'h-72',
  title = 'Loading Live Telemetry Chart...',
}) => {
  return (
    <div className={`glass-card rounded-2xl p-5 border border-slate-800/80 ${height} flex flex-col justify-between relative overflow-hidden animate-pulse`}>
      {/* Top Header Placeholder */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-800 rounded-md" />
          <div className="h-3 w-24 bg-slate-800/60 rounded-md" />
        </div>
        <div className="h-6 w-20 bg-slate-800/80 rounded-lg" />
      </div>

      {/* Shimmering Bar Chart Grid Lines */}
      <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
        <div className="w-full bg-slate-800/40 rounded-t-lg h-[40%]" />
        <div className="w-full bg-emerald-500/20 rounded-t-lg h-[75%]" />
        <div className="w-full bg-slate-800/40 rounded-t-lg h-[50%]" />
        <div className="w-full bg-cyan-500/20 rounded-t-lg h-[90%]" />
        <div className="w-full bg-slate-800/40 rounded-t-lg h-[60%]" />
        <div className="w-full bg-amber-500/20 rounded-t-lg h-[80%]" />
        <div className="w-full bg-slate-800/40 rounded-t-lg h-[45%]" />
      </div>

      {/* Label */}
      <div className="text-center text-xs text-slate-500 font-mono mt-2">{title}</div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-3 animate-pulse">
      <div className="h-4 w-48 bg-slate-800 rounded-md mb-4" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800" />
            <div className="space-y-1">
              <div className="h-3.5 w-28 bg-slate-800 rounded" />
              <div className="h-2.5 w-16 bg-slate-800/60 rounded" />
            </div>
          </div>
          <div className="h-4 w-20 bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-slate-800 rounded" />
        <div className="h-4 w-16 bg-emerald-500/20 rounded" />
      </div>
      <div className="h-8 w-24 bg-slate-800 rounded" />
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="h-10 bg-slate-800/60 rounded-lg" />
        <div className="h-10 bg-slate-800/60 rounded-lg" />
        <div className="h-10 bg-slate-800/60 rounded-lg" />
      </div>
    </div>
  );
};
