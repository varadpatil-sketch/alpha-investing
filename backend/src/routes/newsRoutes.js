import { Router } from 'express';
import { NewsService } from '../services/newsService.js';

const router = Router();

// GET /api/news/market?category=all&refresh=false - Indian Market Financial News
router.get('/market', async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const forceRefresh = req.query.refresh === 'true';

    const newsData = await NewsService.getMarketNews(category, forceRefresh);
    res.json(newsData);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch market news' });
  }
});

// GET /api/news/ticker/:symbol?refresh=false - Ticker Specific News Stream
router.get('/ticker/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const forceRefresh = req.query.refresh === 'true';

    const tickerNews = await NewsService.getTickerNews(symbol, forceRefresh);
    res.json(tickerNews);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch ticker news' });
  }
});

// GET /api/news/sentiment-summary - Overall Market Sentiment Stats
router.get('/sentiment-summary', async (_req, res) => {
  try {
    const newsData = await NewsService.getMarketNews('all', false);
    res.json({
      success: true,
      refreshedAt: newsData.refreshedAt,
      sentimentSummary: newsData.sentimentSummary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch sentiment summary' });
  }
});

export default router;
