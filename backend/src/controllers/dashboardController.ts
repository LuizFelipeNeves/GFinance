import type { Response } from 'express';
import { transactionService } from '../services/transactionService';
import type { AuthRequest } from '../middleware/auth';

export const getDashboard = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const period = (req.query.period as string) || 'monthly';
    const data = await transactionService.getDashboard(userId, period);
    res.json(data);
};
