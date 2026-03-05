import { app } from './app';
import { connectMongoDB } from './db';
import { createImportWorker } from './jobs';
import { logger } from './utils';

const PORT = process.env.PORT || 3001;

const start = async () => {
    await connectMongoDB();

    createImportWorker();

    app.listen(PORT, () => {
        logger.info(`GFinance API running on http://localhost:${PORT}`);
    });
};

start();
