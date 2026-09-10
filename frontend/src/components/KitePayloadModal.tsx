import React, { useEffect, useState } from 'react';
import { X, Code2, Copy, Check, Info } from 'lucide-react';
import { fetchKiteQuotes } from '../services/api';
import { AllocationItem } from '../types';

interface KitePayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStock?: AllocationItem | null;
  portfolioAllocations?: AllocationItem[];
}

export const KitePayloadModal: React.FC<KitePayloadModalProps> = ({
  isOpen,
  onClose,
  selectedStock,
  portfolioAllocations,
}) => {
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const symbols = selectedStock
          ? [`NSE:${selectedStock.symbol}`]
          : portfolioAllocations?.map((a) => `NSE:${a.symbol}`);
        const data = await fetchKiteQuotes(symbols);
        setPayload(data);
      } catch (err) {
        console.error('Failed to fetch Kite payload', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, selectedStock, portfolioAllocations]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    if (!payload) return;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl w-full max-w-3xl border border-slate-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                <span>Zerodha Kite Connect v3 JSON API Payload</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-semibold border border-sky-500/30">
                  {selectedStock ? `NSE:${selectedStock.symbol}` : 'Full Portfolio Payload'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Mock payload formatted for seamless production migration to Zerodha Kite API
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-300" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info Disclaimer */}
        <div className="bg-sky-950/40 px-4 py-2 border-b border-sky-900/40 text-[11px] text-sky-300 flex items-center space-x-2">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            This JSON object mirrors Zerodha's <code className="font-mono bg-sky-900/60 px-1 rounded">/quote</code> response schema with instrument tokens, market depth, and OHLC data.
          </span>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto font-mono text-xs bg-[#090d16] text-emerald-400 leading-relaxed flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 space-x-2">
              <div className="h-4 w-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Fetching Zerodha Kite Payload...</span>
            </div>
          ) : (
            <pre>{JSON.stringify(payload, null, 2)}</pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
