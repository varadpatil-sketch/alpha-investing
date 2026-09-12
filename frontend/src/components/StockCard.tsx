import React from 'react';
import { AllocationItem } from '../types';
import { ShieldCheck, Code2, ExternalLink } from 'lucide-react';
import { usePaperTrading } from '../context/PaperTradingContext';

interface StockCardProps {
  item: AllocationItem;
  onInspectKite: (item: AllocationItem) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ item, onInspectKite }) => {
  const { openTradeModal } = usePaperTrading();

  return (

    <div className="glass-card glass-card-hover rounded-xl p-4 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white tracking-wide font-mono">
                {item.exchange}:{item.symbol}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {item.assetClass}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-slate-300 mt-0.5 truncate max-w-[200px]">{item.name}</h4>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold font-mono text-emerald-400">
              ₹{item.allocatedAmount.toLocaleString('en-IN')}
            </span>
            <div className="text-[10px] text-slate-400 font-semibold font-mono">{item.weightPct}% of Portfolio</div>
          </div>
        </div>

        {/* Description & Metrics */}
        <p className="text-[11px] text-slate-400 mt-3 line-clamp-2 leading-relaxed">{item.description}</p>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-500 block">Sector</span>
            <span className="font-semibold text-slate-200 truncate block">{item.sector}</span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-500 block">5Yr CAGR</span>
            <span className="font-bold text-emerald-400 font-mono block">+{item.expectedCagr}%</span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
            <span className="text-[10px] text-slate-500 block">Risk Rating</span>
            <span
              className={`font-semibold block ${
                item.riskRating === 'Low'
                  ? 'text-emerald-400'
                  : item.riskRating === 'Moderate'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {item.riskRating}
            </span>
          </div>
        </div>
      </div>

      {/* Footer controls, AI Research & Kite JSON payload button */}
      <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1 text-[10px] text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span className="font-mono">Token: #{item.instrumentToken}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openTradeModal(item.symbol, 'BUY', item.allocatedAmount > 0 ? Math.round(item.allocatedAmount / (item.weightPct || 1)) : undefined, item.name)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold transition-all shadow-sm"
            title="Execute Paper Buy/Sell Order"
          >
            <span>Trade</span>
          </button>

          <button
            onClick={() => onInspectKite(item)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-sky-950/50 hover:bg-sky-900/60 text-sky-400 border border-sky-800/50 text-[10px] font-semibold transition-colors"
          >
            <Code2 className="h-3 w-3" />
            <span>Kite JSON</span>
            <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
};

