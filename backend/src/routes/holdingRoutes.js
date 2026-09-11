import { Router } from 'express';
import Holding from '../models/Holding.js';
import { YahooFinanceService } from '../services/yahooFinanceService.js';

const router = Router();

const DEFAULT_DEMO_HOLDINGS = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    quantity: 30,
    averagePrice: 2820.0,
    sector: 'Energy & Power',
    assetClass: 'Large Cap Stock',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    quantity: 45,
    averagePrice: 1460.0,
    sector: 'Financial Services',
    assetClass: 'Large Cap Stock',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    quantity: 15,
    averagePrice: 3850.0,
    sector: 'Technology',
    assetClass: 'Large Cap Stock',
  },
  {
    symbol: 'NIFTYBEES',
    name: 'Nippon India Nifty 50 BeES ETF',
    quantity: 120,
    averagePrice: 242.5,
    sector: 'Index / Diversified',
    assetClass: 'Index ETF',
  },
  {
    symbol: 'GOLDBEES',
    name: 'Nippon India Gold BeES ETF',
    quantity: 150,
    averagePrice: 58.0,
    sector: 'Precious Metals',
    assetClass: 'Debt & Gold ETF',
  },
];

// GET /api/holdings - Get live equity holdings with live LTP & P&L calculations
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo_user_101';
    let dbHoldings = await Holding.find({ userId });

    let rawHoldings = dbHoldings;
    if (!dbHoldings || dbHoldings.length === 0) {
      rawHoldings = DEFAULT_DEMO_HOLDINGS;
    }

    let totalInvested = 0;
    let totalCurrent = 0;
    let totalDayPnL = 0;

    const sectorTotals = {};

    const enrichedHoldings = await Promise.all(
      rawHoldings.map(async (h) => {
        let quote;
        try {
          quote = await YahooFinanceService.getQuote(h.symbol);
        } catch (err) {
          quote = null;
        }

        const lastPrice = quote ? quote.last_price : h.averagePrice;
        const prevClose = quote?.ohlc?.close || lastPrice;
        const quantity = h.quantity;
        const averagePrice = h.averagePrice;

        const investedAmount = Math.round(quantity * averagePrice);
        const currentValue = Math.round(quantity * lastPrice);
        const overallPnL = currentValue - investedAmount;
        const overallPnLPct = investedAmount > 0 ? Math.round((overallPnL / investedAmount) * 10000) / 100 : 0;

        const dayPnL = Math.round(quantity * (lastPrice - prevClose));
        const dayPnLPct = prevClose ? Math.round(((lastPrice - prevClose) / prevClose) * 10000) / 100 : 0;

        totalInvested += investedAmount;
        totalCurrent += currentValue;
        totalDayPnL += dayPnL;

        const sector = h.sector || quote?.sector || 'Equities';
        sectorTotals[sector] = (sectorTotals[sector] || 0) + currentValue;

        return {
          _id: h._id || h.symbol,
          symbol: h.symbol.replace('.NS', ''),
          name: h.name || quote?.name || h.symbol,
          quantity,
          averagePrice,
          lastPrice,
          prevClose,
          investedAmount,
          currentValue,
          overallPnL,
          overallPnLPct,
          dayPnL,
          dayPnLPct,
          sector,
          assetClass: h.assetClass || quote?.asset_class || 'Large Cap Stock',
        };
      })
    );

    const totalOverallPnL = totalCurrent - totalInvested;
    const totalOverallPnLPct = totalInvested > 0 ? Math.round((totalOverallPnL / totalInvested) * 10000) / 100 : 0;
    const totalDayPnLPct = totalCurrent > 0 ? Math.round((totalDayPnL / totalCurrent) * 10000) / 100 : 0;

    // Sector Allocation breakdown for Donut Chart
    const sectorAllocation = Object.entries(sectorTotals).map(([name, value]) => ({
      name,
      value,
      percentage: totalCurrent > 0 ? Math.round((value / totalCurrent) * 1000) / 10 : 0,
    }));

    res.json({
      summary: {
        totalInvested,
        totalCurrent,
        totalOverallPnL,
        totalOverallPnLPct,
        totalDayPnL,
        totalDayPnLPct,
      },
      sectorAllocation,
      holdings: enrichedHoldings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch holdings' });
  }
});

// POST /api/holdings - Add or update a holding position
router.post('/', async (req, res) => {
  try {
    const { userId = 'demo_user_101', symbol, name, quantity, averagePrice, sector, assetClass } = req.body;

    if (!symbol || !quantity || !averagePrice) {
      return res.status(400).json({ error: 'Symbol, quantity, and average price are required' });
    }

    const cleanSymbol = symbol.trim().toUpperCase().replace('.NS', '');

    let holding = await Holding.findOne({ userId, symbol: cleanSymbol });
    if (holding) {
      // Average down/up price calculation
      const oldQty = holding.quantity;
      const oldAvg = holding.averagePrice;
      const newQty = oldQty + Number(quantity);
      const newAvg = (oldQty * oldAvg + Number(quantity) * Number(averagePrice)) / newQty;

      holding.quantity = newQty;
      holding.averagePrice = Math.round(newAvg * 100) / 100;
      await holding.save();
    } else {
      holding = await Holding.create({
        userId,
        symbol: cleanSymbol,
        name: name || cleanSymbol,
        quantity: Number(quantity),
        averagePrice: Number(averagePrice),
        sector: sector || 'Equities',
        assetClass: assetClass || 'Large Cap Stock',
      });
    }

    res.json({ status: 'success', holding });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to save holding position' });
  }
});

// DELETE /api/holdings/:id - Remove a holding position
router.delete('/:id', async (req, res) => {
  try {
    await Holding.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Holding removed' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete holding' });
  }
});

export default router;
