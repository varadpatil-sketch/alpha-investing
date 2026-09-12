import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Layers,
  RotateCcw,
  ShoppingCart,
  History,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePaperTrading } from '../../context/PaperTradingContext';

const SECTOR_COLORS = [
  '#10b981', // emerald
  '#38bdf8', // sky
  '#f59e0b', // amber
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

export const PortfolioManager: React.FC = () => {
  const {
    cashBalance,
    holdings,
    transactions,
    openTradeModal,
    resetWallet,
    updateHoldingPrices,
  } = usePaperTrading();

  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    updateHoldingPrices();
    const interval = setInterval(updateHoldingPrices, 30000); // 30s auto sync
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsUpdating(true);
    await updateHoldingPrices();
    setTimeout(() => setIsUpdating(false), 500);
  };

  // Calculations
  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.averagePrice, 0);
  const totalCurrentHoldingsValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const totalPortfolioValue = cashBalance + totalCurrentHoldingsValue;
  const initialCapital = 10000;
  const overallPnL = totalPortfolioValue - initialCapital;
  const overallPnLPct = initialCapital > 0 ? (overallPnL / initialCapital) * 100 : 0;
  const isOverallPositive = overallPnL >= 0;

  // Sector allocation data for Pie Chart
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    const sec = h.sector || 'Equities';
    const val = h.quantity * h.currentPrice;
    sectorMap[sec] = (sectorMap[sec] || 0) + val;
  });

  const sectorAllocation = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Paper Trading Portfolio & Wallet</span>
                <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  Virtual ₹10,000 Cash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Execute virtual buy/sell orders in real-time. Practice trading strategies risk-free with live market prices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openTradeModal('RELIANCE', 'BUY')}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Trade Any Stock</span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={isUpdating}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors"
            title="Refresh live quotes"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${isUpdating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Live Prices</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset paper trading wallet to ₹10,000 cash balance? This will clear active holdings.')) {
                resetWallet();
              }
            }}
            className="flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors text-xs font-mono"
            title="Reset wallet to ₹10,000"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Wallet</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paper Cash Balance */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-400 font-extrabold uppercase tracking-wider">
            <span>Available Paper Cash</span>
            <Wallet className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            ₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Virtual cash ready to invest</p>
        </div>

        {/* Total Portfolio Value */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
            Total Portfolio Value
          </span>
          <div className="text-2xl font-black font-mono text-white">
            ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Cash + Current Holdings Value</p>
        </div>

        {/* Total Invested Capital */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
            Holdings Invested Value
          </span>
          <div className="text-2xl font-black font-mono text-sky-400">
            ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Cost basis of active positions</p>
        </div>

        {/* Total Overall P&L */}
        <div
          className={`glass-card rounded-2xl p-5 border space-y-1 ${
            isOverallPositive
              ? 'border-emerald-500/30 bg-emerald-950/20'
              : 'border-rose-500/30 bg-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Overall Paper P&L
            </span>
            {isOverallPositive ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              isOverallPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOverallPositive ? '+' : ''}₹{overallPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div
            className={`text-xs font-extrabold font-mono ${
              isOverallPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ({isOverallPositive ? '+' : ''}
            {overallPnLPct.toFixed(2)}% vs initial ₹10,000)
          </div>
        </div>
      </div>

      {/* Main Grid: Holdings & History Tabs + Sector Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Container (2 Columns) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          
          {/* Tab Selector */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('holdings')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'holdings'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Active Holdings ({holdings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'history'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Trade History ({transactions.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              {activeTab === 'holdings' ? 'Real-Time Paper Positions' : 'Order Execution Audit Log'}
            </span>
          </div>

          {/* Active Holdings View */}
          {activeTab === 'holdings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-2">Ticker</th>
                    <th className="py-3 px-2 text-right">Qty</th>
                    <th className="py-3 px-2 text-right">Avg Price</th>
                    <th className="py-3 px-2 text-right">LTP (₹)</th>
                    <th className="py-3 px-2 text-right">Current Val</th>
                    <th className="py-3 px-2 text-right">Overall P&L</th>
                    <th className="py-3 px-2 text-center">Trade Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {holdings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="space-y-2 max-w-sm mx-auto">
                          <ShoppingCart className="h-8 w-8 mx-auto text-amber-400 opacity-60" />
                          <div className="text-sm font-bold text-slate-300">No Active Paper Holdings</div>
                          <p className="text-xs text-slate-400">
                            Your wallet has <strong className="text-amber-400">₹{cashBalance.toLocaleString('en-IN')}</strong> ready. Click on any stock ticker across the website to BUY your first stock!
                          </p>
                          <button
                            onClick={() => openTradeModal('RELIANCE', 'BUY')}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md mt-2"
                          >
                            <span>Buy RELIANCE</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    holdings.map((h) => {
                      const costValue = h.quantity * h.averagePrice;
                      const currentValue = h.quantity * h.currentPrice;
                      const positionPnL = currentValue - costValue;
                      const positionPnLPct = costValue > 0 ? (positionPnL / costValue) * 100 : 0;
                      const isPosPositive = positionPnL >= 0;

                      return (
                        <tr key={h.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-3.5 px-2">
                            <button
                              onClick={() => openTradeModal(h.symbol, 'BUY', h.currentPrice, h.name)}
                              className="text-left font-extrabold text-white hover:text-amber-400 transition-colors group flex items-center gap-1.5"
                            >
                              <span>{h.symbol}</span>
                              <span className="text-[10px] text-amber-400/80 group-hover:underline">Trade</span>
                            </button>
                            <div className="text-[10px] text-slate-500 truncate max-w-[130px] font-sans">
                              {h.name}
                            </div>
                          </td>

                          <td className="py-3.5 px-2 text-right font-bold text-slate-200">{h.quantity}</td>

                          <td className="py-3.5 px-2 text-right text-slate-300">
                            ₹{h.averagePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>

                          <td className="py-3.5 px-2 text-right font-bold text-emerald-400">
                            ₹{h.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>

                          <td className="py-3.5 px-2 text-right font-bold text-white">
                            ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>

                          <td className="py-3.5 px-2 text-right">
                            <div className={`font-bold ${isPosPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPosPositive ? '+' : ''}₹{positionPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-[10px] font-bold ${isPosPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ({isPosPositive ? '+' : ''}
                              {positionPnLPct.toFixed(2)}%)
                            </div>
                          </td>

                          <td className="py-3.5 px-2 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => openTradeModal(h.symbol, 'BUY', h.currentPrice, h.name)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                                title="Buy More Shares"
                              >
                                + Buy
                              </button>

                              <button
                                onClick={() => openTradeModal(h.symbol, 'SELL', h.currentPrice, h.name)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors"
                                title="Sell Shares"
                              >
                                - Sell
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Trade History View */}
          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-2">Timestamp</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Ticker</th>
                    <th className="py-3 px-2 text-right">Qty</th>
                    <th className="py-3 px-2 text-right">Exec Price (₹)</th>
                    <th className="py-3 px-2 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No trade transactions logged yet. Executed Buy/Sell orders will appear here.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-2 text-slate-400 text-[11px]">
                          {new Date(tx.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </td>

                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            tx.type === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}>
                            {tx.type}
                          </span>
                        </td>

                        <td className="py-3 px-2 font-bold text-white">{tx.symbol}</td>

                        <td className="py-3 px-2 text-right text-slate-200">{tx.quantity}</td>

                        <td className="py-3 px-2 text-right text-slate-300">
                          ₹{tx.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-2 text-right font-bold text-amber-300">
                          ₹{tx.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Asset Allocation Donut Chart (1 Column) */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <PieIcon className="h-4 w-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Paper Asset Allocation</h3>
          </div>

          {sectorAllocation.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sectorAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Value']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend
                    formatter={(val: string) => <span className="text-xs text-slate-300 font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
              <PieIcon className="h-10 w-10 text-slate-700 mb-2" />
              <span>No active holdings to chart. Buy stocks to see sector diversification.</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-300 font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Paper Trading Insight</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Paper trading allows you to test rebalancing, risk management, and entry timing before deploying real capital on Zerodha/Kite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
