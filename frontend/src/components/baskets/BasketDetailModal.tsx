import React, { useState } from 'react';
import { X, Shield, TrendingUp, DollarSign, Copy, Check, ExternalLink, Layers, PieChart } from 'lucide-react';
import { BasketItem } from '../../services/api';

interface BasketDetailModalProps {
  basket: BasketItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BasketDetailModal: React.FC<BasketDetailModalProps> = ({ basket, isOpen, onClose }) => {
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [activeTab, setActiveTab] = useState<'constituents' | 'kitePayload'>('constituents');

  if (!isOpen || !basket) return null;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(basket.kiteOrderPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl shrink-0">
              {basket.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-100">{basket.title}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getRiskColor(basket.riskRating)}`}>
                  {basket.riskRating} Risk
                </span>
                {basket.isCustom && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                    Custom Basket
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">{basket.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Metrics Banner */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-950/60 border-b border-slate-800">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Min Investment</span>
              <span className="text-lg font-mono font-bold text-slate-100">
                ₹{basket.minCapital.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Expected CAGR</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{basket.expectedCagr}%</span>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Live Day Return</span>
              <span
                className={`text-lg font-mono font-bold ${
                  basket.dayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {basket.dayChangePct >= 0 ? '+' : ''}
                {basket.dayChangePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-6">
          <button
            onClick={() => setActiveTab('constituents')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'constituents'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4" /> Constituents ({basket.constituentsCount})
          </button>
          <button
            onClick={() => setActiveTab('kitePayload')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'kitePayload'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" /> Zerodha Kite Multi-Order Payload
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          {activeTab === 'constituents' ? (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Sector</th>
                      <th className="py-3 px-4 text-right">Weight</th>
                      <th className="py-3 px-4 text-right">Live LTP</th>
                      <th className="py-3 px-4 text-right">1D Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {basket.constituents.map((c) => (
                      <tr key={c.symbol} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-medium">
                          <div className="font-bold text-slate-100">{c.symbol}</div>
                          <div className="text-xs text-slate-400 truncate max-w-[200px]">{c.name}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {c.sector}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-200">
                          {c.weightPct}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-100">
                          ₹{c.ltp.toLocaleString('en-IN')}
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-bold ${
                            c.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {c.pctChange >= 0 ? '+' : ''}
                          {c.pctChange}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Ready-to-execute Zerodha Kite v3 basket JSON order array. Copy and pass into Kite Connect API.
                </p>
                <button
                  onClick={handleCopyPayload}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPayload ? 'Copied Payload!' : 'Copy JSON'}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto max-h-64">
                {JSON.stringify(basket.kiteOrderPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            * Min investment calculated dynamically based on Yahoo Finance live quotes.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopyPayload}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Invest via Zerodha Kite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
