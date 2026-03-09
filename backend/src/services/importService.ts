import { createReadStream, statSync } from 'fs';
import { parse } from 'fast-csv';
import { deleteFile } from '../utils/fileStorage';
import { getRowValue, parseType, parseValue } from '../utils/csv';
import { transactionRepository } from '../data/transactionRepository';
import { importJobRepository } from '../data/importJobRepository';
import type { ImportJobData } from '../jobs/queue';
import { logger } from '../utils';

export type ImportJobInput = ImportJobData;

const BATCH_SIZE = 1000;

const transformRow = (row: Record<string, string>, userId: string) => ({
    userId,
    desc: getRowValue(row, 'descricao', 'desc', 'description'),
    cat: getRowValue(row, 'categoria', 'cat', 'category'),
    date: getRowValue(row, 'data', 'date'),
    val: parseValue(getRowValue(row, 'valor', 'val', 'value')),
    type: parseType(getRowValue(row, 'tipo', 'type'))
});

export const processImportJob = async (input: ImportJobInput): Promise<void> => {
    const { jobId, filePath } = input;

    try {
        const job = await importJobRepository.getById(jobId);
        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        const fileStats = statSync(filePath);
        if (fileStats.size === 0) {
            throw new Error('File is empty');
        }

        let total = 0;
        let processed = 0;
        const batch: ReturnType<typeof transformRow>[] = [];

        const flushBatch = async () => {
            if (batch.length > 0) {
                await transactionRepository.addBatch(batch);
                batch.length = 0;
            }
        };

        await new Promise<void>((resolve, reject) => {
            const stream = createReadStream(filePath).pipe(parse({ headers: true }));

            stream.on('data', (row: Record<string, string>) => {
                const normalized: Record<string, string> = {};
                for (const [key, value] of Object.entries(row)) {
                    normalized[key.trim().toLowerCase()] = value;
                }

                batch.push(transformRow(normalized, job.userId));
                total++;

                if (batch.length >= BATCH_SIZE) {
                    stream.pause();
                }
            });

            stream.on('end', async () => {
                await flushBatch();
                resolve();
            });

            stream.on('error', reject);

            stream.on('pause', async () => {
                await flushBatch();
                processed += BATCH_SIZE;
                const progress = Math.min(Math.round((processed / total) * 100), 100);
                await importJobRepository.update(jobId, { total, progress });
                stream.resume();
            });
        });

        await importJobRepository.update(jobId, {
            status: 'complete',
            progress: 100,
            total,
            imported: total
        });

        logger.info(`Import job ${jobId} completed: ${total} transactions`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Import job ${jobId} failed: ${errorMessage}`);
        await importJobRepository.update(jobId, {
            status: 'failed',
            error: errorMessage
        });
        throw error;
    } finally {
        deleteFile(filePath);
    }
};
