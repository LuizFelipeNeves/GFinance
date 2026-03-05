import { Queue, Worker } from 'bullmq';
import { processImportJob } from '../services/importService';

export const IMPORT_QUEUE_NAME = 'import-transactions';

export type ImportJobData = {
    jobId: string;
    filePath: string;
};

const getConnectionOptions = () => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
});

let _queue: Queue | null = null;
let _worker: Worker | null = null;

export const getImportQueue = (): Queue => {
    if (!_queue) {
        _queue = new Queue(IMPORT_QUEUE_NAME, {
            connection: getConnectionOptions(),
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            }
        });
    }
    return _queue;
};

export const createImportWorker = (): Worker => {
    if (!_worker) {
        _worker = new Worker<ImportJobData>(
            IMPORT_QUEUE_NAME,
            async (job) => {
                await processImportJob(job.data);
            },
            {
                connection: getConnectionOptions(),
                concurrency: 5
            }
        );

        _worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed`);
        });

        _worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed:`, err.message);
        });
    }

    return _worker;
};
