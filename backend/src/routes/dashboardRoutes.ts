import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { dashboardSchema } from '../validation';

const router = Router();

router.get('/', authMiddleware, validate(dashboardSchema, 'query'), getDashboard);

export default router;
