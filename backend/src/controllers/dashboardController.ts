import type { Request, Response } from 'express';
import { transactionService } from '../services/transactionService';

export const getDashboard = (_req: Request, res: Response) => {
    const data = transactionService.getDashboard();
    res.json(data);
};
