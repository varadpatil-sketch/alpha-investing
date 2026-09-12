import React, { useState } from 'react';
import { X, Plus, Trash2, Sliders, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { createCustomBasket, BasketItem } from '../../services/api';

interface CreateBasketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBasket: BasketItem) => void;
}

const AVAILABLE_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy & Power' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financial Services' },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Technology' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Financial Services' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'FMCG' },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'FMCG' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecom' },
  { symbol: 'LARSEN', name: 'Larsen & Toubro Ltd.', sector: 'Capital Goods' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Financial Services' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Financial Services' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financial Services' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobiles' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automobiles' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automobiles' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Technology' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Ind.', sector: 'Healthcare' },
  { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Utilities' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Durables' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'Technology' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Construction' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp. of India', sector: 'Utilities' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Mining' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Paints' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', sector: 'FMCG' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', sector: 'Financial Services' },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd.', sector: 'Technology' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp.', sector: 'Energy' },
];

const EMOJI_ICONS = ['⚡', '🛡️', '💎', '🚀', '📈', '🤖', '🌾', '🔋', '🔥', '👑'];

interface DraftConstituent {
  symbol: string;
  name: string;
  weightPct: number;
  sector: string;
}

export const CreateBasketModal: React.FC<CreateBasketModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [riskRating, setRiskRating] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [expectedCagr, setExpectedCagr] = useState<number>(15.0);

  const [constituents, setConstituents] = useState<DraftConstituent[]>([
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', weightPct: 50, sector: 'Energy & Power' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', weightPct: 50, sector: 'Technology' },
  ]);

  const [selectedStockToAdd, setSelectedStockToAdd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalWeight = constituents.reduce((acc, c) => acc + (Number(c.weightPct) || 0), 0);
  const isValidWeight = Math.abs(totalWeight - 100) <= 0.5;

  const handleAddStock = () => {
    if (!selectedStockToAdd) return;
    if (constituents.some((c) => c.symbol === selectedStockToAdd)) {
      setErrorMsg('Stock is already added to this basket.');
      return;
    }
    const found = AVAILABLE_STOCKS.find((s) => s.symbol === selectedStockToAdd);
    if (!found) return;

    setErrorMsg('');
    const newConstituents = [...constituents, { ...found, weightPct: 0 }];
    setConstituents(newConstituents);
    setSelectedStockToAdd('');
  };

  const handleRemoveStock = (symbol: string) => {
    setConstituents(constituents.filter((c) => c.symbol !== symbol));
  };

  const handleWeightChange = (symbol: string, val: number) => {
    setConstituents(
      constituents.map((c) => (c.symbol === symbol ? { ...c, weightPct: Math.max(0, Math.min(100, val)) } : c))
    );
  };

  const handleAutoEqualizeWeights = () => {
    if (constituents.length === 0) return;
    const equalVal = Math.floor(100 / constituents.length);
    const remainder = 100 - equalVal * constituents.length;

    const equalized = constituents.map((c, idx) => ({
      ...c,
      weightPct: idx === 0 ? equalVal + remainder : equalVal,
    }));
    setConstituents(equalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an interactive name for your custom basket.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a short description explaining the investment theme.');
      return;
    }
    if (constituents.length === 0) {
      setErrorMsg('Basket must contain at least 1 constituent stock.');
      return;
    }
    if (!isValidWeight) {
      setErrorMsg(`Total constituent weight must equal exactly 100%. Current total: ${totalWeight}%`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await createCustomBasket({
        title,
        description,
        icon,
        riskRating,
        expectedCagr,
        constituents,
      });

      onSuccess(res.basket);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to save basket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl">
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Create Custom Basket <Sparkles className="w-4 h-4 text-cyan-400" />
              </h2>
              <p className="text-xs text-slate-400">Design your personalized Smallcase equity basket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Interactive Basket Name & Emoji Icon */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              1. Basket Name & Icon
            </label>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl cursor-pointer hover:border-cyan-500 transition-colors">
                  {icon}
                </div>
                <div className="absolute top-14 left-0 z-20 hidden group-hover:flex gap-1 p-2 bg-slate-950 border border-slate-800 rounded-xl shadow-xl">
                  {EMOJI_ICONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setIcon(e)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-lg"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Alpha Momentum Titans"
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-base font-medium"
                required
              />
            </div>
          </div>

          {/* Theme Description */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Investment Theme & Rationale
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the thesis (e.g., Basket of market leaders across Tech and Energy poised for multi-year expansion)"
              rows={2}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
              required
            />
          </div>

          {/* Risk Profile & Target CAGR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Risk Profile
              </label>
              <select
                value={riskRating}
                onChange={(e) => setRiskRating(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="Low">Low Risk (Defensive)</option>
                <option value="Moderate">Moderate Risk (Balanced)</option>
                <option value="High">High Risk (Aggressive Growth)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Target CAGR (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="50"
                value={expectedCagr}
                onChange={(e) => setExpectedCagr(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Add Stock Constituent Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                3. Select Constituents (Nifty Leaders)
              </label>
              <button
                type="button"
                onClick={handleAutoEqualizeWeights}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <Sliders className="w-3.5 h-3.5" /> Auto Equal Weights
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedStockToAdd}
                onChange={(e) => setSelectedStockToAdd(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Choose Stock to Add --</option>
                {AVAILABLE_STOCKS.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} ({s.sector})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddStock}
                disabled={!selectedStockToAdd}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold rounded-xl text-sm flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Constituents & Weight Sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
              <span>Constituent Stock</span>
              <span>Weight Allocation (%)</span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {constituents.map((c) => (
                <div
                  key={c.symbol}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-4 justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{c.symbol}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {c.sector}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.name}</p>
                  </div>

                  <div className="flex items-center gap-3 w-48">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={c.weightPct}
                      onChange={(e) => handleWeightChange(c.symbol, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={c.weightPct}
                        onChange={(e) => handleWeightChange(c.symbol, Number(e.target.value))}
                        className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-right text-xs font-mono font-bold focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStock(c.symbol)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove stock"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Allocation Weight Progress Bar */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Total Basket Weight Allocation:</span>
                <span
                  className={`font-mono font-bold text-sm flex items-center gap-1 ${
                    isValidWeight ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {totalWeight}% / 100%
                  {isValidWeight ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    totalWeight > 100
                      ? 'bg-red-500'
                      : isValidWeight
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, totalWeight)}%` }}
                />
              </div>
              {!isValidWeight && (
                <p className="text-[11px] text-amber-400/90 text-right">
                  {totalWeight > 100
                    ? `Over-allocated by ${totalWeight - 100}%. Adjust sliders.`
                    : `Under-allocated by ${100 - totalWeight}%. Use 'Auto Equal Weights' or adjust sliders.`}
                </p>
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isValidWeight || !title.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all"
            >
              {submitting ? 'Creating Basket...' : 'Create Stock Basket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
