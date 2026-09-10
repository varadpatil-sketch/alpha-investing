import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alpha_investing';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection failed or not running locally. Running in In-Memory / Mock Persistence mode.');
    return false;
  }
};
