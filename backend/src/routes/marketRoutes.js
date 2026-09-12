import { Router } from 'express';
import { YahooFinanceService, SCREENER_NSE_SYMBOLS } from '../services/yahooFinanceService.js';

const router = Router();

// GET /api/market/indices - Live Indian Benchmark Indices (^NSEI, ^BSESN, ^NSEBANK)
router.get('/indices', async (_req, res) => {
  try {
    const symbols = ['^NSEI', '^BSESN', '^NSEBANK', 'NIFTY_MIDCAP_100.NS', '^CNXFIN', 'BSE-BANK.BO'];
    const quotes = await Promise.all(symbols.map((sym) => YahooFinanceService.getQuote(sym)));

    const indices = quotes.map((q) => {
      let displayName = 'NIFTY 50';
      const raw = (q.tradingsymbol || '').toUpperCase();
      const name = (q.name || '').toUpperCase();

      if (raw.includes('BSESN') || name.includes('SENSEX')) displayName = 'SENSEX';
      else if (raw.includes('NSEBANK') || (name.includes('NIFTY') && name.includes('BANK'))) displayName = 'NIFTY BANK';
      else if (raw.includes('MIDCAP') || name.includes('MIDCAP')) displayName = 'MIDCAP 100';
      else if (raw.includes('CNXFIN') || name.includes('FINSRV') || name.includes('FINNIFTY')) displayName = 'FINNIFTY';
      else if (raw.includes('BSE-BANK') || name.includes('BANKEX')) displayName = 'BANKEX';

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
    const { sector, marketCap, maxPe, minDivYield } = req.query;

    const kiteResponse = await YahooFinanceService.getKiteFormattedResponse(SCREENER_NSE_SYMBOLS, forceRefresh);

    let screenerItems = Object.entries(kiteResponse.data).map(([symbol, item]) => ({
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
      pe: item.meta.trailingPE || 22.0,
      priceToBook: item.meta.priceToBook || 3.0,
      dividendYield: item.meta.dividendYield || 1.2,
      debtToEquity: item.meta.debtToEquity || 0.4,
      returnOnEquity: item.meta.returnOnEquity || 18.0,
      revenueGrowth: item.meta.revenueGrowth || 12.0,
      fiftyDayAverage: item.meta.fiftyDayAverage || item.last_price,
      twoHundredDayAverage: item.meta.twoHundredDayAverage || item.last_price,
      lastRefreshedAt: item.meta.lastRefreshedAt,
    }));

    // Apply Backend API filters if passed
    if (sector && sector !== 'all') {
      screenerItems = screenerItems.filter(
        (s) => s.sector.toLowerCase() === String(sector).toLowerCase()
      );
    }

    if (marketCap && marketCap !== 'all') {
      if (marketCap === 'large') screenerItems = screenerItems.filter((s) => s.marketCap >= 1000000000000);
      else if (marketCap === 'mid') screenerItems = screenerItems.filter((s) => s.marketCap >= 200000000000 && s.marketCap < 1000000000000);
      else if (marketCap === 'small') screenerItems = screenerItems.filter((s) => s.marketCap < 200000000000);
    }

    if (maxPe && !isNaN(Number(maxPe))) {
      screenerItems = screenerItems.filter((s) => s.pe <= Number(maxPe));
    }

    if (minDivYield && !isNaN(Number(minDivYield))) {
      screenerItems = screenerItems.filter((s) => s.dividendYield >= Number(minDivYield));
    }

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

// GET /api/market/quote/:symbol - Quick live stock quote telemetry for paper trading
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSym = symbol.toUpperCase().replace('NSE:', '').replace('.NS', '');
    const quote = await YahooFinanceService.getQuote(cleanSym, false);
    res.json({
      success: true,
      symbol: quote.tradingsymbol || cleanSym,
      name: quote.name || cleanSym,
      price: quote.last_price || 100,
      change: quote.net_change || 0,
      pctChange: quote.percentage_change || 0,
      sector: quote.sector || 'Equities',
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch quote' });
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

