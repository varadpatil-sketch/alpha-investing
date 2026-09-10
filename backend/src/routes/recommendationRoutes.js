import { Router } from 'express';
import { RecommendationEngine } from '../services/recommendationEngine.js';

const router = Router();

// POST /api/recommendations/generate
router.post('/generate', async (req, res) => {
  try {
    const { investmentAmount, timeHorizonYears, expectedReturnPct, riskTolerance } = req.body;

    if (!investmentAmount || !timeHorizonYears || !expectedReturnPct || !riskTolerance) {
      res.status(400).json({
        error: 'Missing required parameters: investmentAmount, timeHorizonYears, expectedReturnPct, riskTolerance',
      });
      return;
    }

    const payload = {
      investmentAmount: Number(investmentAmount),
      timeHorizonYears: Number(timeHorizonYears),
      expectedReturnPct: Number(expectedReturnPct),
      riskTolerance,
    };

    const result = await RecommendationEngine.generatePortfolio(payload);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate recommendation' });
  }
});

export default router;
