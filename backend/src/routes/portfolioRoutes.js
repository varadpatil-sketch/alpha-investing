import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Portfolio from '../models/Portfolio.js';
import { isMongoConnected } from '../config/db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'alpha_investing_jwt_secret_key_2026';

const inMemoryPortfolios = [];

const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// POST /api/portfolios/save
router.post('/save', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const portfolioData = req.body;

    if (!portfolioData.title || !portfolioData.allocations) {
      res.status(400).json({ error: 'Invalid portfolio payload' });
      return;
    }

    if (isMongoConnected) {
      const saved = await Portfolio.create({
        ...portfolioData,
        userId: user?.id || 'guest',
      });
      res.status(201).json({ message: 'Portfolio saved successfully', portfolio: saved });
    } else {
      const saved = {
        _id: 'mem_pf_' + Date.now(),
        ...portfolioData,
        userId: user?.id || 'guest',
        createdAt: new Date(),
      };
      inMemoryPortfolios.push(saved);
      res.status(201).json({ message: 'Portfolio saved (In-Memory mode)', portfolio: saved });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to save portfolio' });
  }
});

// GET /api/portfolios
router.get('/', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const userId = user?.id || 'guest';

    if (isMongoConnected) {
      const portfolios = await Portfolio.find({ userId }).sort({ createdAt: -1 });
      res.json({ portfolios });
    } else {
      const portfolios = inMemoryPortfolios.filter((p) => p.userId === userId);
      res.json({ portfolios });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch portfolios' });
  }
});

// DELETE /api/portfolios/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Portfolio.findByIdAndDelete(id);
      res.json({ message: 'Portfolio deleted' });
    } else {
      const idx = inMemoryPortfolios.findIndex((p) => p._id === id);
      if (idx !== -1) inMemoryPortfolios.splice(idx, 1);
      res.json({ message: 'Portfolio deleted (In-Memory)' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete portfolio' });
  }
});

export default router;
