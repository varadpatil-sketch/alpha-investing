import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchStockQuote } from '../services/api';

export interface PaperHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  sector?: string;
  lastUpdated?: string;
}

export interface PaperTransaction {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: string;
}

export interface TradeModalState {
  isOpen: boolean;
  symbol: string;
  name?: string;
  price?: number;
  initialMode: 'BUY' | 'SELL';
}

interface PaperTradingContextType {
  cashBalance: number;
  holdings: PaperHolding[];
  transactions: PaperTransaction[];
  tradeModalState: TradeModalState;
  openTradeModal: (symbol: string, initialMode?: 'BUY' | 'SELL', price?: number, name?: string) => void;
  closeTradeModal: () => void;
  buyStock: (symbol: string, name: string, quantity: number, price: number, sector?: string) => { success: boolean; message: string };
  sellStock: (symbol: string, quantity: number, price: number) => { success: boolean; message: string };
  resetWallet: () => void;
  updateHoldingPrices: () => Promise<void>;
  getHoldingForSymbol: (symbol: string) => PaperHolding | undefined;
}

const STORAGE_KEY = 'alpha_paper_trading_v1';

const PaperTradingContext = createContext<PaperTradingContextType | undefined>(undefined);

export const PaperTradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cashBalance, setCashBalance] = useState<number>(10000);
  const [holdings, setHoldings] = useState<PaperHolding[]>([]);
  const [transactions, setTransactions] = useState<PaperTransaction[]>([]);
  const [tradeModalState, setTradeModalState] = useState<TradeModalState>({
    isOpen: false,
    symbol: '',
    initialMode: 'BUY',
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.cashBalance === 'number') setCashBalance(parsed.cashBalance);
        if (Array.isArray(parsed.holdings)) setHoldings(parsed.holdings);
        if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      }
    } catch (err) {
      console.error('Failed to parse paper trading state from localStorage', err);
    }
  }, []);

  // Save state to localStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          cashBalance,
          holdings,
          transactions,
        })
      );
    } catch (err) {
      console.error('Failed to save paper trading state to localStorage', err);
    }
  }, [cashBalance, holdings, transactions]);

  const openTradeModal = (symbol: string, initialMode: 'BUY' | 'SELL' = 'BUY', price?: number, name?: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('NSE:', '').replace('.NS', '');
    setTradeModalState({
      isOpen: true,
      symbol: cleanSym,
      initialMode,
      price,
      name,
    });
  };

  const closeTradeModal = () => {
    setTradeModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const getHoldingForSymbol = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('NSE:', '').replace('.NS', '');
    return holdings.find((h) => h.symbol.toUpperCase() === cleanSym);
  };

  const buyStock = (
    symbol: string,
    name: string,
    quantity: number,
    price: number,
    sector: string = 'Equities'
  ): { success: boolean; message: string } => {
    if (quantity <= 0) return { success: false, message: 'Quantity must be at least 1' };
    if (price <= 0) return { success: false, message: 'Invalid price' };

    const totalCost = quantity * price;
    if (totalCost > cashBalance) {
      return {
        success: false,
        message: `Insufficient Paper Wallet cash. Required: ₹${totalCost.toLocaleString('en-IN')}, Available: ₹${cashBalance.toLocaleString('en-IN')}`,
      };
    }

    const cleanSym = symbol.trim().toUpperCase().replace('NSE:', '').replace('.NS', '');
    const cleanName = name || cleanSym;

    // Deduct cash balance
    const newCash = cashBalance - totalCost;
    setCashBalance(newCash);

    // Update holdings
    setHoldings((prev) => {
      const existingIdx = prev.findIndex((h) => h.symbol.toUpperCase() === cleanSym);
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const newQty = existing.quantity + quantity;
        const newAvg = (existing.quantity * existing.averagePrice + totalCost) / newQty;

        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          averagePrice: newAvg,
          currentPrice: price,
          lastUpdated: new Date().toISOString(),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `paper-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            symbol: cleanSym,
            name: cleanName,
            quantity,
            averagePrice: price,
            currentPrice: price,
            sector,
            lastUpdated: new Date().toISOString(),
          },
        ];
      }
    });

    // Record transaction
    const tx: PaperTransaction = {
      id: `tx-${Date.now()}`,
      symbol: cleanSym,
      name: cleanName,
      type: 'BUY',
      quantity,
      price,
      totalAmount: totalCost,
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);

    return {
      success: true,
      message: `Successfully bought ${quantity} share(s) of ${cleanSym} for ₹${totalCost.toLocaleString('en-IN')}`,
    };
  };

  const sellStock = (
    symbol: string,
    quantity: number,
    price: number
  ): { success: boolean; message: string } => {
    if (quantity <= 0) return { success: false, message: 'Quantity must be at least 1' };
    if (price <= 0) return { success: false, message: 'Invalid price' };

    const cleanSym = symbol.trim().toUpperCase().replace('NSE:', '').replace('.NS', '');
    const existing = holdings.find((h) => h.symbol.toUpperCase() === cleanSym);

    if (!existing || existing.quantity <= 0) {
      return { success: false, message: `You do not own any shares of ${cleanSym}` };
    }

    if (quantity > existing.quantity) {
      return {
        success: false,
        message: `Cannot sell ${quantity} shares. You only own ${existing.quantity} share(s) of ${cleanSym}`,
      };
    }

    const totalReturn = quantity * price;

    // Add cash balance
    setCashBalance((prev) => prev + totalReturn);

    // Update holdings
    setHoldings((prev) => {
      const existingIdx = prev.findIndex((h) => h.symbol.toUpperCase() === cleanSym);
      if (existingIdx < 0) return prev;

      const target = prev[existingIdx];
      const remainingQty = target.quantity - quantity;

      if (remainingQty <= 0) {
        return prev.filter((_, idx) => idx !== existingIdx);
      } else {
        const updated = [...prev];
        updated[existingIdx] = {
          ...target,
          quantity: remainingQty,
          currentPrice: price,
          lastUpdated: new Date().toISOString(),
        };
        return updated;
      }
    });

    // Record transaction
    const tx: PaperTransaction = {
      id: `tx-${Date.now()}`,
      symbol: cleanSym,
      name: existing.name,
      type: 'SELL',
      quantity,
      price,
      totalAmount: totalReturn,
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);

    return {
      success: true,
      message: `Successfully sold ${quantity} share(s) of ${cleanSym} for ₹${totalReturn.toLocaleString('en-IN')}`,
    };
  };

  const resetWallet = () => {
    setCashBalance(10000);
    setHoldings([]);
    setTransactions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const updateHoldingPrices = async () => {
    if (holdings.length === 0) return;
    const updated = await Promise.all(
      holdings.map(async (h) => {
        try {
          const q = await fetchStockQuote(h.symbol);
          if (q && q.price) {
            return { ...h, currentPrice: q.price, lastUpdated: new Date().toISOString() };
          }
        } catch (e) {}
        return h;
      })
    );
    setHoldings(updated);
  };

  return (
    <PaperTradingContext.Provider
      value={{
        cashBalance,
        holdings,
        transactions,
        tradeModalState,
        openTradeModal,
        closeTradeModal,
        buyStock,
        sellStock,
        resetWallet,
        updateHoldingPrices,
        getHoldingForSymbol,
      }}
    >
      {children}
    </PaperTradingContext.Provider>
  );
};

export const usePaperTrading = (): PaperTradingContextType => {
  const ctx = useContext(PaperTradingContext);
  if (!ctx) {
    throw new Error('usePaperTrading must be used within a PaperTradingProvider');
  }
  return ctx;
};
