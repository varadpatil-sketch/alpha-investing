import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingCart, DollarSign, Wallet, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePaperTrading } from '../../context/PaperTradingContext';
import { fetchStockQuote } from '../../services/api';

export const TradeModal: React.FC = () => {
  const { tradeModalState, closeTradeModal, cashBalance, buyStock, sellStock, getHoldingForSymbol } = usePaperTrading();
  const { isOpen, symbol, initialMode, price: initialPrice, name: initialName } = tradeModalState;

  const [mode, setMode] = useState<'BUY' | 'SELL'>(initialMode || 'BUY');
  const [quantity, setQuantity] = useState<number>(1);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [quote, setQuote] = useState<{
    name: string;
    price: number;
    change: number;
    pctChange: number;
    sector: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const holding = symbol ? getHoldingForSymbol(symbol) : undefined;
  const ownedQty = holding ? holding.quantity : 0;

  useEffect(() => {
    if (isOpen && symbol) {
      setMode(initialMode || 'BUY');
      setQuantity(1);
      setFeedback(null);

      if (initialPrice && initialPrice > 0) {
        setQuote({
          name: initialName || symbol,
          price: initialPrice,
          change: 0,
          pctChange: 0,
          sector: 'Equities',
        });
      } else {
        loadQuote(symbol);
      }
    }
  }, [isOpen, symbol, initialMode, initialPrice, initialName]);

  const loadQuote = async (sym: string) => {
    setLoadingQuote(true);
    try {
      const res = await fetchStockQuote(sym);
      if (res && res.price) {
        setQuote({
          name: res.name || sym,
          price: res.price,
          change: res.change || 0,
          pctChange: res.pctChange || 0,
          sector: res.sector || 'Equities',
        });
      } else {
        // Fallback estimated price
        setQuote({
          name: sym,
          price: 1250,
          change: 15.5,
          pctChange: 1.25,
          sector: 'Equities',
        });
      }
    } catch (err) {
      setQuote({
        name: sym,
        price: 1000,
        change: 0,
        pctChange: 0,
        sector: 'Equities',
      });
    } finally {
      setLoadingQuote(false);
    }
  };

  if (!isOpen) return null;

  const currentPrice = quote?.price || 0;
  const totalOrderValue = Math.round(quantity * currentPrice * 100) / 100;
  const remainingCash = cashBalance - totalOrderValue;
  const maxBuyQty = currentPrice > 0 ? Math.floor(cashBalance / currentPrice) : 0;
  const maxSellQty = ownedQty;

  const handleExecuteTrade = () => {
    if (!symbol || currentPrice <= 0) return;
    setFeedback(null);

    if (mode === 'BUY') {
      const res = buyStock(symbol, quote?.name || symbol, quantity, currentPrice, quote?.sector);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        setTimeout(() => {
          closeTradeModal();
        }, 1500);
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } else {
      const res = sellStock(symbol, quantity, currentPrice);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        setTimeout(() => {
          closeTradeModal();
        }, 1500);
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    }
  };

  const isBuyDisabled = mode === 'BUY' && (totalOrderValue > cashBalance || quantity <= 0);
  const isSellDisabled = mode === 'SELL' && (quantity > ownedQty || quantity <= 0 || ownedQty <= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl ${mode === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white font-mono tracking-wide">{symbol}</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">NSE</span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">{quote?.name || symbol}</p>
            </div>
          </div>

          <button
            onClick={closeTradeModal}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Mode Switcher: BUY / SELL */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 font-mono">
            <button
              onClick={() => setMode('BUY')}
              className={`py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'BUY'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>BUY STOCK</span>
            </button>
            <button
              onClick={() => setMode('SELL')}
              className={`py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'SELL'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>SELL STOCK</span>
            </button>
          </div>

          {/* Live Price Header */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Live Market Price (CMP)</span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {loadingQuote ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                ) : (
                  `₹${currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                )}
              </div>
            </div>

            {quote && quote.pctChange !== 0 && (
              <div className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono flex items-center space-x-1 border ${
                quote.pctChange >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {quote.pctChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{quote.pctChange >= 0 ? '+' : ''}{quote.pctChange.toFixed(2)}%</span>
              </div>
            )}
          </div>

          {/* Holdings Status Indicator */}
          <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Currently Owned Shares:</span>
            <span className="font-mono font-bold text-amber-400">{ownedQty} share(s)</span>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Order Quantity
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black border border-slate-700 text-lg flex items-center justify-center transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg font-black font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black border border-slate-700 text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center space-x-1.5 pt-1">
              {[1, 5, 10, 50].map((add) => (
                <button
                  key={add}
                  onClick={() => setQuantity((q) => q + add)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-800 transition-colors"
                >
                  +{add}
                </button>
              ))}
              <button
                onClick={() => setQuantity(mode === 'BUY' ? Math.max(1, maxBuyQty) : Math.max(1, maxSellQty))}
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-mono font-bold border border-amber-500/30 transition-colors"
              >
                MAX ({mode === 'BUY' ? maxBuyQty : maxSellQty})
              </button>
            </div>
          </div>

          {/* Trade Order Calculation Summary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Total Order Value:</span>
              <span className="font-bold text-white text-sm">₹{totalOrderValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Paper Wallet Cash:</span>
              <span className="font-bold text-emerald-400">₹{cashBalance.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between">
              <span className="text-slate-400">{mode === 'BUY' ? 'Remaining Cash:' : 'Cash After Sale:'}</span>
              <span className={`font-bold ${mode === 'BUY' && remainingCash < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                ₹{(mode === 'BUY' ? remainingCash : cashBalance + totalOrderValue).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Feedback Toast Banner */}
          {feedback && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 border ${
              feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Action Execution Button */}
          <button
            onClick={handleExecuteTrade}
            disabled={mode === 'BUY' ? isBuyDisabled : isSellDisabled}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center space-x-2 ${
              mode === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 disabled:opacity-40 disabled:hover:bg-emerald-500'
                : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20 disabled:opacity-40 disabled:hover:bg-rose-500'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>
              {mode === 'BUY'
                ? `CONFIRM BUY (${quantity} ${quantity === 1 ? 'Share' : 'Shares'})`
                : `CONFIRM SELL (${quantity} ${quantity === 1 ? 'Share' : 'Shares'})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
