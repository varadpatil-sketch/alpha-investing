import mongoose from 'mongoose';

const BasketSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo_user_101' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '⚡' },
  riskRating: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Moderate' },
  expectedCagr: { type: Number, default: 15.0 },
  isCustom: { type: Boolean, default: true },
  constituents: [
    {
      symbol: { type: String, required: true },
      name: { type: String },
      weightPct: { type: Number, required: true },
      sector: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Basket', BasketSchema);
