import React, { useEffect, useState } from 'react';
import { Sparkles, Plus, Trash2, Shield, TrendingUp, DollarSign, Layers, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchBaskets, deleteCustomBasket, BasketItem } from '../../services/api';
import { CreateBasketModal } from './CreateBasketModal';
import { BasketDetailModal } from './BasketDetailModal';

export const BasketManager: React.FC = () => {
  const [presets, setPresets] = useState<BasketItem[]>([]);
  const [customBaskets, setCustomBaskets] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState<BasketItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await fetchBaskets();
      setPresets(data.presets || []);
      setCustomBaskets(data.customBaskets || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load stock baskets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCustom = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete custom basket "${title}"?`)) return;

    try {
      await deleteCustomBasket(id);
      setCustomBaskets(customBaskets.filter((b) => b._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete basket');
    }
  };

  const handleCustomCreated = (newBasket: BasketItem) => {
    setCustomBaskets([newBasket, ...customBaskets]);
    setSelectedBasket(newBasket);
  };

  const getRiskBadgeColor = (risk: string) => {
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
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Smallcase Portfolio Baskets
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Curated & Custom Stock Baskets
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Invest in thematic portfolios of Indian equities with transparent weight allocations, live Yahoo Finance LTP tracking, and instant Zerodha Kite order execution payload generation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 rounded-xl transition-colors"
              title="Refresh Live LTPs"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" /> Build Custom Basket
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse p-6" />
          ))}
        </div>
      ) : (
        <>
          {/* Section 1: User Custom Baskets */}
          {customBaskets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  My Custom Baskets ({customBaskets.length})
                </h2>
                <span className="text-xs text-slate-400">Created by you with custom stock weights</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {customBaskets.map((basket) => (
                  <div
                    key={basket._id}
                    onClick={() => setSelectedBasket(basket)}
                    className="group relative p-6 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {basket.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getRiskBadgeColor(
                              basket.riskRating
                            )}`}
                          >
                            {basket.riskRating} Risk
                          </span>
                          <button
                            onClick={(e) => handleDeleteCustom(e, basket._id, basket.title)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete custom basket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {basket.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{basket.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Min Capital</span>
                          <span className="font-mono font-bold text-slate-200">
                            ₹{basket.minCapital.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Exp. CAGR</span>
                          <span className="font-mono font-bold text-emerald-400">{basket.expectedCagr}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{basket.constituentsCount} Stocks</span>
                      <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View & Invest <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Smallcase Presets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Smallcase Preset Baskets</h2>
              <span className="text-xs text-slate-400">Institutional grade thematic baskets</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {presets.map((basket) => (
                <div
                  key={basket._id}
                  onClick={() => setSelectedBasket(basket)}
                  className="group relative p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {basket.icon}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getRiskBadgeColor(
                          basket.riskRating
                        )}`}
                      >
                        {basket.riskRating} Risk
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {basket.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{basket.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Min Capital</span>
                        <span className="font-mono font-bold text-slate-200">
                          ₹{basket.minCapital.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Exp. CAGR</span>
                        <span className="font-mono font-bold text-emerald-400">{basket.expectedCagr}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{basket.constituentsCount} Stocks</span>
                    <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View & Invest <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <CreateBasketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCustomCreated}
      />

      <BasketDetailModal
        basket={selectedBasket}
        isOpen={!!selectedBasket}
        onClose={() => setSelectedBasket(null)}
      />
    </div>
  );
};
