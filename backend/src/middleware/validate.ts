import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate = <T extends z.ZodSchema>(schema: T, source: 'body' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = source === 'query' ? req.query : req.body;
            schema.parse(data);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
};
