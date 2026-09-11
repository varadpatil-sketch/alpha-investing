import { Router } from 'express';
import {
  generatePortfolioInsights,
  generateStockAnalysis,
  askMarketAssistant,
} from '../services/geminiService.js';
import { AlphaAnalystService } from '../services/alphaAnalystService.js';

const router = Router();

// GET /api/ai/status - Check if Gemini SDK & API key are active
router.get('/status', async (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey.trim() !== 'your_gemini_api_key_here');
  res.json({
    status: isConfigured ? 'active' : 'unconfigured',
    model: 'gemini-3.6-flash',
    isConfigured,
    message: isConfigured ? 'Gemini AI service is initialized and ready.' : 'GEMINI_API_KEY missing in backend/.env',
  });
});

// POST /api/ai/alpha-analyst - Goldman Sachs Institutional Research Engine
router.post('/alpha-analyst', async (req, res) => {
  try {
    const { symbol, userProfile } = req.body;
    if (!symbol) {
      res.status(400).json({ error: 'Symbol parameter is required (e.g. RELIANCE, TCS, HDFCBANK)' });
      return;
    }

    const report = await AlphaAnalystService.generateGoldmanSachsReport(symbol, userProfile || {});
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate Alpha Analyst report' });
  }
});

// POST /api/ai/portfolio-insight - Generate AI insights for portfolio recommendation
router.post('/portfolio-insight', async (req, res) => {
  try {
    const portfolioData = req.body;
    if (!portfolioData || !portfolioData.allocations) {
      res.status(400).json({ error: 'Invalid portfolio data: allocations required' });
      return;
    }

    const result = await generatePortfolioInsights(portfolioData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate portfolio insights' });
  }
});

// POST /api/ai/stock-analysis - Generate AI research analysis for single stock
router.post('/stock-analysis', async (req, res) => {
  try {
    const stockData = req.body;
    if (!stockData || !stockData.symbol) {
      res.status(400).json({ error: 'Stock symbol is required' });
      return;
    }

    const result = await generateStockAnalysis(stockData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to analyze stock' });
  }
});

// POST /api/ai/chat - Interactive AI Market Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message field is required' });
      return;
    }

    const result = await askMarketAssistant(message, context);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to process AI chat query' });
  }
});

export default router;
