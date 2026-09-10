import React, { useEffect, useState } from 'react';
import { X, Bookmark, Trash2, Calendar, IndianRupee } from 'lucide-react';
import { deleteSavedPortfolio, fetchSavedPortfolios } from '../services/api';
import { SavedPortfolio } from '../types';

interface SavedPortfoliosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPortfolio: (portfolio: SavedPortfolio) => void;
}

export const SavedPortfoliosModal: React.FC<SavedPortfoliosModalProps> = ({
  isOpen,
  onClose,
  onSelectPortfolio,
}) => {
  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSavedPortfolios();
      setPortfolios(data);
    } catch (err) {
      console.error('Failed to load saved portfolios', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSavedPortfolio(id);
      setPortfolios(portfolios.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Failed to delete portfolio', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Saved Portfolios</h3>
              <p className="text-xs text-slate-400">Review past stock allocation scenarios</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading saved scenarios...</div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No saved portfolios found yet. Generate a recommendation and click "Save Portfolio" to bookmark it!
            </div>
          ) : (
            portfolios.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  onSelectPortfolio(item);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors flex items-center space-x-2">
                    <span>{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize font-mono">
                      {item.riskTolerance} Risk
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center space-x-1 font-mono text-emerald-400">
                      <IndianRupee className="h-3 w-3" />
                      <span>{item.investmentAmount.toLocaleString('en-IN')}</span>
                    </span>
                    <span>{item.timeHorizonYears} Yrs Horizon</span>
                    <span>Target: {item.expectedReturnPct}%</span>
                    <span className="flex items-center space-x-1 text-[10px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(item._id, e)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Portfolio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
