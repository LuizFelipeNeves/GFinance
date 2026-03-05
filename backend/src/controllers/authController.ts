import type { Request, Response } from 'express';
import { authService } from '../services/authService';

export const login = (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = authService.login({ email, password });

    if (!result.success) {
        res.status(401).json(result);
        return;
    }

    res.json(result);
};

export const register = (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const result = authService.register({ name, email, password });

    if (!result.success) {
        res.status(400).json(result);
        return;
    }

    res.status(201).json(result);
};
