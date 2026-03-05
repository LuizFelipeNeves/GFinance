import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { validate } from '../middleware/validate';
import { dashboardSchema } from '../validation';

const router = Router();

router.get('/', validate(dashboardSchema, 'query'), getDashboard);

export default router;
