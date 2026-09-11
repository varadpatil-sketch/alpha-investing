import { Router } from 'express';
import Basket from '../models/Basket.js';
import { YahooFinanceService } from '../services/yahooFinanceService.js';

const router = Router();

const SMALLCASE_PRESETS = [
  {
    _id: 'preset_it_ai_giants',
    title: 'IT & AI Champions',
    description: 'Basket of India’s top software exporters and cloud innovation leaders',
    icon: '⚡',
    riskRating: 'Moderate',
    expectedCagr: 16.5,
    isCustom: false,
    constituents: [
      { symbol: 'TCS', name: 'Tata Consultancy Services', weightPct: 30, sector: 'Technology' },
      { symbol: 'INFY', name: 'Infosys Ltd.', weightPct: 25, sector: 'Technology' },
      { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', weightPct: 20, sector: 'Technology' },
      { symbol: 'WIPRO', name: 'Wipro Ltd.', weightPct: 15, sector: 'Technology' },
      { symbol: 'LTIM', name: 'LTIMindtree Ltd.', weightPct: 10, sector: 'Technology' },
    ],
  },
  {
    _id: 'preset_financial_titans',
    title: 'Financial Titans',
    description: 'High-growth private banks, credit lenders, and asset managers benefiting from credit expansion',
    icon: '🛡️',
    riskRating: 'Moderate',
    expectedCagr: 15.2,
    isCustom: false,
    constituents: [
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', weightPct: 30, sector: 'Financial Services' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', weightPct: 25, sector: 'Financial Services' },
      { symbol: 'SBIN', name: 'State Bank of India', weightPct: 20, sector: 'Financial Services' },
      { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', weightPct: 15, sector: 'Financial Services' },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', weightPct: 10, sector: 'Financial Services' },
    ],
  },
  {
    _id: 'preset_wealth_shield',
    title: 'All-Weather Wealth Shield',
    description: 'Low-drawdown defensive portfolio combining Nifty 50, Gold BeES, and Liquid BeES',
    icon: '💎',
    riskRating: 'Low',
    expectedCagr: 12.8,
    isCustom: false,
    constituents: [
      { symbol: 'NIFTYBEES', name: 'Nippon India Nifty 50 BeES ETF', weightPct: 40, sector: 'Index / Diversified' },
      { symbol: 'JUNIORBEES', name: 'Nippon India Nifty Next 50 ETF', weightPct: 20, sector: 'Index / Diversified' },
      { symbol: 'GOLDBEES', name: 'Nippon India Gold BeES ETF', weightPct: 25, sector: 'Precious Metals' },
      { symbol: 'LIQUIDBEES', name: 'Nippon India Liquid BeES ETF', weightPct: 15, sector: 'Money Market' },
    ],
  },
  {
    _id: 'preset_ev_mobility',
    title: 'EV & Mobility Revolution',
    description: 'Automotive OEMs and energy titans pioneering electric vehicle transformation in India',
    icon: '🚀',
    riskRating: 'High',
    expectedCagr: 18.4,
    isCustom: false,
    constituents: [
      { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', weightPct: 35, sector: 'Automobiles' },
      { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', weightPct: 25, sector: 'Automobiles' },
      { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', weightPct: 20, sector: 'Automobiles' },
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', weightPct: 20, sector: 'Energy & Power' },
    ],
  },
];

// Helper to enrich basket constituents with live Yahoo Finance LTP
const enrichBasket = async (b) => {
  let minCapitalSum = 0;
  let weightedDayChangeSum = 0;

  const enrichedConstituents = await Promise.all(
    b.constituents.map(async (c) => {
      let quote;
      try {
        quote = await YahooFinanceService.getQuote(c.symbol);
      } catch (e) {
        quote = null;
      }

      const ltp = quote ? quote.last_price : 1000;
      const pctChange = quote ? quote.percentage_change : 0;

      minCapitalSum += ltp;
      weightedDayChangeSum += (pctChange * c.weightPct) / 100;

      return {
        symbol: c.symbol.replace('.NS', ''),
        name: c.name || quote?.name || c.symbol,
        weightPct: c.weightPct,
        ltp,
        pctChange,
        sector: c.sector || quote?.sector || 'Equities',
        assetClass: quote?.asset_class || 'Large Cap Stock',
      };
    })
  );

  // Minimum investment capital rounded up to nearest ₹500
  const minCapital = Math.ceil(minCapitalSum / 500) * 500 || 5000;

  // Build Zerodha Kite v3 order payload format
  const kiteOrderPayload = enrichedConstituents.map((c) => ({
    tradingsymbol: c.symbol,
    exchange: 'NSE',
    transaction_type: 'BUY',
    order_type: 'MARKET',
    quantity: Math.max(1, Math.round((minCapital * (c.weightPct / 100)) / c.ltp)),
    product: 'CNC',
    last_price: c.ltp,
  }));

  return {
    _id: b._id,
    title: b.title,
    description: b.description,
    icon: b.icon || '⚡',
    riskRating: b.riskRating || 'Moderate',
    expectedCagr: b.expectedCagr || 15.0,
    isCustom: b.isCustom,
    minCapital,
    dayChangePct: Math.round(weightedDayChangeSum * 100) / 100,
    constituentsCount: enrichedConstituents.length,
    constituents: enrichedConstituents,
    kiteOrderPayload,
  };
};

// GET /api/baskets - List preset and custom baskets with live LTP analytics
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo_user_101';
    const dbBaskets = await Basket.find({ userId }).sort({ createdAt: -1 });

    const presetsEnriched = await Promise.all(SMALLCASE_PRESETS.map((p) => enrichBasket(p)));
    const customEnriched = await Promise.all(dbBaskets.map((b) => enrichBasket(b.toObject())));

    res.json({
      count: presetsEnriched.length + customEnriched.length,
      presets: presetsEnriched,
      customBaskets: customEnriched,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch baskets' });
  }
});

// POST /api/baskets - Create custom Smallcase-style basket
router.post('/', async (req, res) => {
  try {
    const {
      userId = 'demo_user_101',
      title,
      description,
      icon = '⚡',
      riskRating = 'Moderate',
      expectedCagr = 15.0,
      constituents,
    } = req.body;

    if (!title || !description || !constituents || constituents.length === 0) {
      return res.status(400).json({ error: 'Title, description, and at least 1 stock constituent are required' });
    }

    // Validate weights sum to 100% (within +/- 1%)
    const totalWeight = constituents.reduce((sum, c) => sum + Number(c.weightPct || 0), 0);
    if (Math.abs(totalWeight - 100) > 1.5) {
      return res.status(400).json({ error: `Total constituent weights must equal 100%. Current total: ${totalWeight}%` });
    }

    const cleanConstituents = constituents.map((c) => ({
      symbol: c.symbol.trim().toUpperCase().replace('.NS', ''),
      name: c.name || c.symbol,
      weightPct: Number(c.weightPct),
      sector: c.sector || 'Equities',
    }));

    const basket = await Basket.create({
      userId,
      title,
      description,
      icon,
      riskRating,
      expectedCagr: Number(expectedCagr),
      isCustom: true,
      constituents: cleanConstituents,
    });

    const enriched = await enrichBasket(basket.toObject());
    res.json({ status: 'success', basket: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create basket' });
  }
});

// DELETE /api/baskets/:id - Delete custom basket
router.delete('/:id', async (req, res) => {
  try {
    await Basket.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Custom basket deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete basket' });
  }
});

export default router;
