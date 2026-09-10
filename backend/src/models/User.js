import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  riskTolerance: { type: String, enum: ['conservative', 'moderate', 'aggressive'], default: 'moderate' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
