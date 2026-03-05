import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register } from '../controllers/authController';
import { validate } from '../middleware';
import { loginSchema, registerSchema } from '../validation';

const router = Router();

const isTest = process.env.NODE_ENV === 'test';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts, please try again later',
    skip: () => isTest,
});

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/register', authLimiter, validate(registerSchema), register);

export default router;
