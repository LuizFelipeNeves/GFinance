import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { authRoutes, transactionRoutes, dashboardRoutes } from './routes/index';
import { logger } from './utils';

export const app = express();

const isTest = process.env.NODE_ENV === 'test';

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP',
    skip: () => isTest,
});

export const setupRoutes = () => {
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '10kb' }));
    app.use(globalLimiter);

    app.use((req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info(`${req.method} ${req.path}`, {
                method: req.method,
                path: req.path,
                status: res.statusCode,
                duration,
            });
        });
        next();
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req: Request, res: Response) => {
        res.json(swaggerSpec);
    });

    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/transactions', transactionRoutes);
};

setupRoutes();
