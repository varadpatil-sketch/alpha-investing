import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  title: { type: String, required: true },
  investmentAmount: { type: Number, required: true },
  timeHorizonYears: { type: Number, required: true },
  expectedReturnPct: { type: Number, required: true },
  riskTolerance: { type: String, required: true },
  realityScore: { type: String, enum: ['realistic', 'moderate_risk', 'high_risk_warning'], required: true },
  realityMessage: { type: String, required: true },
  allocations: [
    {
      symbol: { type: String, required: true },
      name: { type: String, required: true },
      exchange: { type: String, required: true },
      instrumentToken: { type: Number, required: true },
      weightPct: { type: Number, required: true },
      allocatedAmount: { type: Number, required: true },
      sector: { type: String, required: true },
      assetClass: { type: String, required: true },
      riskRating: { type: String, required: true },
      expectedCagr: { type: Number, required: true },
    },
  ],
  projectedValue1Yr: { type: Number, required: true },
  projectedValue3Yr: { type: Number, required: true },
  projectedValue5Yr: { type: Number, required: true },
  projectedValue10Yr: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Portfolio', PortfolioSchema);
