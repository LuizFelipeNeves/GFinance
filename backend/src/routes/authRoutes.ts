import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { validate } from '../middleware';
import { loginSchema, registerSchema } from '../validation';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

export default router;
