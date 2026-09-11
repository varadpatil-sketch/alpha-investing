import mongoose from 'mongoose';

const HoldingSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo_user_101' },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  averagePrice: { type: Number, required: true },
  sector: { type: String, default: 'Equities' },
  assetClass: { type: String, default: 'Large Cap Stock' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Holding', HoldingSchema);
