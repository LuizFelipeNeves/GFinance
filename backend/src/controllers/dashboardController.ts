import type { Request, Response } from 'express';
import { transactionService } from '../services/transactionService';

export const getDashboard = async (req: Request, res: Response) => {
    const period = (req.query.period as string) || 'monthly';
    const data = await transactionService.getDashboard(period);
    res.json(data);
};
