import type { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwtService';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Token não fornecido' });
        return;
    }

    const token = authHeader.substring(7);
    const payload = jwtService.verify(token);

    if (!payload) {
        res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
        return;
    }

    req.user = payload;
    next();
};
