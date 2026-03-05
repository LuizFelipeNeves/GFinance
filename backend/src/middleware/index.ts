export { validate } from './validate';
export { authMiddleware, type AuthRequest } from './auth';
export { uploadMiddleware } from './upload';

import { type Request, type Response, type NextFunction } from 'express';
import { logger } from '../utils';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            logger.error('Controller error', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
    };
};
