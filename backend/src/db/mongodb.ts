import mongoose from 'mongoose';
import { logger } from '../utils';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gfinance';

export const connectMongoDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('MongoDB connected');
    } catch (error) {
        logger.error('MongoDB connection error:', error as Error);
        process.exit(1);
    }
};

export const disconnectMongoDB = async (): Promise<void> => {
    await mongoose.disconnect();
};
