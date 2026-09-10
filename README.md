# Alpha Investing 📈 f

**Alpha Investing** is an intelligent stock and portfolio recommendation platform tailored for Indian retail investors (NSE/BSE). It allows users to define their investment amount (₹), time horizon, and target return expectations, evaluating risk feasibility ("Reality Check") and generating a safe, diversified asset allocation across Nifty 50 ETFs, blue-chip stocks, and gold hedges.

---

## Key Features

1. **Reality Check Engine:** Evaluates target ROI against risk tolerance and time horizon to prevent unrealistic expectations.
2. **Diversified Asset Allocator:** Balances Nifty 50 Index ETFs (`NSE:NIFTYBEES`), Large-Cap Blue Chips (`NSE:RELIANCE`, `NSE:HDFCBANK`, `NSE:TCS`), Growth Equities, and Gold/Liquid Hedges (`NSE:GOLDBEES`).
3. **Zerodha Kite API Integration Ready:** Returns quote data mirroring Zerodha Kite Connect v3 JSON specification (`instrument_token`, `ohlc`, `buy/sell depth`, `last_price`). Includes an interactive payload inspector.
4. **Compounding Wealth Projection:** Visualizes estimated growth over 1, 3, 5, and 10 years.
5. **Historical Backtest Simulation:** Shows how the strategy performed relative to the Nifty 50 index over past market cycles.
6. **User Auth & Portfolio Persistence:** JWT Authentication with MongoDB database storage (and graceful in-memory fallback).

---

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Running at: [http://localhost:5000](http://localhost:5000)  
Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)  
Kite Quotes API: [http://localhost:5000/api/market/kite-quotes](http://localhost:5000/api/market/kite-quotes)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Running at: [http://localhost:3000](http://localhost:3000)
