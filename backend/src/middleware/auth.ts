import type { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Token não informado' });
        return;
    }

    const token = authHeader.substring(7);

    if (!token) {
        res.status(401).json({ success: false, message: 'Token inválido' });
        return;
    }

    next();
};
