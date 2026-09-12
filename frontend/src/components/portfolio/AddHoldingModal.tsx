import React, { useState } from 'react';
import { X, Plus, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { addHoldingPosition } from '../../services/api';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_TICKERS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy & Power' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financial Services' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Financial Services' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Financial Services' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Financial Services' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financial Services' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology' },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Technology' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Technology' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'Technology' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobiles' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automobiles' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automobiles' },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'Consumer Goods' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'Consumer Goods' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Goods' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Ltd.', sector: 'Healthcare & Pharma' },
  { symbol: 'CIPLA', name: 'Cipla Ltd.', sector: 'Healthcare & Pharma' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals & Mining' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Infrastructure' },
  { symbol: 'NIFTYBEES', name: 'Nippon India Nifty 50 BeES ETF', sector: 'Index / Diversified' },
  { symbol: 'GOLDBEES', name: 'Nippon India Gold BeES ETF', sector: 'Precious Metals' },
  { symbol: 'LIQUIDBEES', name: 'Nippon India Liquid BeES ETF', sector: 'Money Market' },
];

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [symbol, setSymbol] = useState<string>('RELIANCE');
  const [quantity, setQuantity] = useState<number>(10);
  const [averagePrice, setAveragePrice] = useState<number>(2800);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || quantity <= 0 || averagePrice <= 0) {
      setError('Please enter valid quantity and purchase price');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selected = AVAILABLE_TICKERS.find((t) => t.symbol === symbol);
      await addHoldingPosition({
        symbol,
        name: selected?.name || symbol,
        quantity: Number(quantity),
        averagePrice: Number(averagePrice),
        sector: selected?.sector || 'Equities',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add holding position');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg text-white">Add Equity Position</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Ticker Select */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Stock / ETF Ticker
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
            >
              {AVAILABLE_TICKERS.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol} — {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Number of Shares / Units
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 25"
            />
          </div>

          {/* Average Buy Price (₹) Input */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Average Buy Price (₹)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={averagePrice}
              onChange={(e) => setAveragePrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 1450.50"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Add Position'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
