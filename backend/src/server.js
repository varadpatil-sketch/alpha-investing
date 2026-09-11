import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import holdingRoutes from './routes/holdingRoutes.js';
import basketRoutes from './routes/basketRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/holdings', holdingRoutes);
app.use('/api/baskets', basketRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'Alpha Investing Backend API',
    version: '1.0.0',
    market: 'Indian Stock Market (NSE/BSE)',
    kiteMockSupported: true,
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Alpha Investing Server running on http://localhost:${PORT}`);
    console.log(`📊 Kite Mock API available at http://localhost:${PORT}/api/market/kite-quotes`);
  });
};

startServer();
