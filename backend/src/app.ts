import express, { type Request, type Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { authRoutes, transactionRoutes, dashboardRoutes } from './routes/index';

export const app = express();

export const setupRoutes = () => {
    app.use(cors());
    app.use(express.json());

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req: Request, res: Response) => {
        res.json(swaggerSpec);
    });

    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/transactions', transactionRoutes);
};

setupRoutes();
