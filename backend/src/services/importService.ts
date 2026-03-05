import { readFile, deleteFile } from '../utils/fileStorage';
import { parseCsv, getRowValue, parseType, parseValue } from '../utils/csv';
import { transactionRepository } from '../data/transactionRepository';
import { importJobRepository } from '../data/importJobRepository';
import type { ImportJobData } from '../jobs/queue';

export type ImportJobInput = ImportJobData;

export const processImportJob = async (input: ImportJobInput): Promise<void> => {
    const { jobId, filePath } = input;

    try {
        const fileContent = readFile(filePath);
        const rows = parseCsv(fileContent);
        const total = rows.length;

        await importJobRepository.update(jobId, { total });

        const newTransactions = rows.map(r => ({
            desc: getRowValue(r, 'descricao', 'desc', 'description'),
            cat: getRowValue(r, 'categoria', 'cat', 'category'),
            date: getRowValue(r, 'data', 'date'),
            val: parseValue(getRowValue(r, 'valor', 'val', 'value')),
            type: parseType(getRowValue(r, 'tipo', 'type'))
        }));

        await transactionRepository.addBatch(newTransactions);

        await importJobRepository.update(jobId, {
            status: 'complete',
            progress: 100,
            imported: newTransactions.length
        });
    } finally {
        deleteFile(filePath);
    }
};
