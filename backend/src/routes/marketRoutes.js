import { Router } from 'express';
import { YahooFinanceService, SCREENER_NSE_SYMBOLS } from '../services/yahooFinanceService.js';

const router = Router();

// GET /api/market/indices - Live Indian Benchmark Indices (^NSEI, ^BSESN, ^NSEBANK)
router.get('/indices', async (_req, res) => {
  try {
    const symbols = ['^NSEI', '^BSESN', '^NSEBANK'];
    const quotes = await Promise.all(symbols.map((sym) => YahooFinanceService.getQuote(sym)));

    const indices = quotes.map((q) => {
      let displayName = 'NIFTY 50';
      if (q.tradingsymbol.includes('BSESN') || q.name.includes('SENSEX')) displayName = 'SENSEX';
      if (q.tradingsymbol.includes('NSEBANK') || q.name.includes('BANK')) displayName = 'NIFTY BANK';

      return {
        symbol: displayName,
        rawSymbol: q.tradingsymbol,
        price: q.last_price,
        change: q.net_change,
        pctChange: q.percentage_change,
      };
    });

    res.json({ indices });
  } catch (error) {
    res.status(503).json({
      error: 'Live Indian indices currently unavailable from Yahoo Finance API',
    });
  }
});

// GET /api/market/nifty50 - Live Nifty 50 Index (^NSEI)
router.get('/nifty50', async (_req, res) => {
  try {
    const quote = await YahooFinanceService.getQuote('^NSEI');
    res.json({
      symbol: 'NIFTY 50',
      price: quote.last_price,
      change: quote.net_change,
      pctChange: quote.percentage_change,
    });
  } catch (error) {
    res.status(503).json({
      error: 'Live Nifty 50 data currently unavailable from Yahoo Finance API',
    });
  }
});

// GET /api/market/screener - Real-Time Live Indian Stock Screener
router.get('/screener', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const kiteResponse = await YahooFinanceService.getKiteFormattedResponse(SCREENER_NSE_SYMBOLS, forceRefresh);

    const screenerItems = Object.entries(kiteResponse.data).map(([symbol, item]) => ({
      symbol: symbol.replace('NSE:', ''),
      fullSymbol: symbol,
      name: item.meta.name,
      exchange: item.meta.exchange || 'NSE',
      price: item.last_price,
      netChange: item.net_change,
      pctChange: item.percentage_change,
      open: item.ohlc.open,
      high: item.ohlc.high,
      low: item.ohlc.low,
      close: item.ohlc.close,
      volume: item.volume,
      sector: item.meta.sector,
      assetClass: item.meta.asset_class,
      riskRating: item.meta.risk_rating,
      fiftyTwoWeekHigh: item.meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: item.meta.fiftyTwoWeekLow,
      marketCap: item.meta.marketCap,
      lastRefreshedAt: item.meta.lastRefreshedAt,
    }));

    res.json({
      count: screenerItems.length,
      refreshedAt: kiteResponse.refreshedAt,
      stocks: screenerItems,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch screener stock data' });
  }
});

// GET /api/market/kite-quotes?symbols=NSE:NIFTYBEES,NSE:RELIANCE
router.get('/kite-quotes', async (req, res) => {
  try {
    const symbolsParam = req.query.symbols;
    const symbols = symbolsParam ? symbolsParam.split(',') : undefined;

    const kiteResponse = await YahooFinanceService.getKiteFormattedResponse(symbols);
    res.json(kiteResponse);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch market quotes' });
  }
});

// GET /api/market/chart/:symbol?timeframe=1D - OHLCV Historical Candles for TradingView Chart
router.get('/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = req.query.timeframe || '1D';

    const chartData = await YahooFinanceService.getHistoricalChart(symbol, timeframe);
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch historical chart data' });
  }
});

// GET /api/market/instruments
router.get('/instruments', async (_req, res) => {
  try {
    const kiteResponse = await YahooFinanceService.getKiteFormattedResponse(SCREENER_NSE_SYMBOLS);
    const instruments = Object.values(kiteResponse.data).map((d) => d.meta);
    res.json({ count: instruments.length, instruments });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to list instruments' });
  }
});

export default router;
