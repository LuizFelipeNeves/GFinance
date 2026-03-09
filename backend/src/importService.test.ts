import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import { processImportJob } from './services/importService';
import { transactionRepository } from './data/transactionRepository';
import { importJobRepository } from './data/importJobRepository';
import { saveFile } from './utils/fileStorage';

const TEST_USER_ID = 'test-user';

describe('processImportJob', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        await transactionRepository.clear();
    });

    it('should process CSV with standard column names', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,1000,Trabalho,Salário';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const updatedJob = await importJobRepository.getById(job.id);
        expect(updatedJob?.status).toBe('complete');
        expect(updatedJob?.imported).toBe(1);
        expect(updatedJob?.total).toBe(1);

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(1);
        expect(transactions[0].desc).toBe('Salário');
        expect(transactions[0].cat).toBe('Trabalho');
        expect(transactions[0].date).toBe('09/03/2026');
        expect(transactions[0].val).toBe(1000);
        expect(transactions[0].type).toBe('in');
    });

    it('should process CSV with alternative column names', async () => {
        const csv = 'data,type,val,cat,desc\n09/03/2026,in,500,Trabalho,Freelance';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(1);
        expect(transactions[0].desc).toBe('Freelance');
        expect(transactions[0].val).toBe(500);
        expect(transactions[0].type).toBe('in');
    });

    it('should parse "entrada" and "saida" as types', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,1000,Trabalho,Salário\n09/03/2026,saida,500,Alimentação,Supermercado';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(2);
        const types = transactions.map(t => t.type).sort();
        expect(types).toEqual(['in', 'out']);
    });

    it('should parse monetary values with R$ symbol', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,"R$ 1.500,00",Trabalho,Salário';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions[0].val).toBe(1500);
    });

    it('should parse numeric values without symbol', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,1500,Trabalho,Salário';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions[0].val).toBe(1500);
    });

    it('should handle empty CSV', async () => {
        const csv = 'data,tipo,valor,categoria,descricao';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const updatedJob = await importJobRepository.getById(job.id);
        expect(updatedJob?.status).toBe('complete');
        expect(updatedJob?.imported).toBe(0);

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(0);
    });

    it('should delete file after processing', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,1000,Trabalho,Salário';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should throw error when job not found', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,1000,Trabalho,Salário';
        const filePath = saveFile(csv, TEST_USER_ID);

        await expect(processImportJob({ jobId: 'non-existent-id', filePath }))
            .rejects.toThrow('Job non-existent-id not found');

        const updatedJob = await importJobRepository.getById('non-existent-id');
        expect(updatedJob).toBeUndefined();
    });

    it('should process multiple rows in a single batch', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n' +
            '08/03/2026,entrada,1000,Trabalho,Salário\n' +
            '09/03/2026,saida,500,Alimentação,Supermercado\n' +
            '09/03/2026,entrada,2000,Freelance,Projeto\n' +
            '09/03/2026,saida,100,Transporte,Uber';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(4);
    });

    it('should process rows with negative values', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,saida,-500,Alimentação,Supermercado';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(1);
        expect(transactions[0].val).toBe(-500);
    });

    it('should handle values with decimal separator', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,1234.56,Trabalho,Freelance';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(1);
        expect(transactions[0].val).toBe(123456);
    });

    it('should process rows with description field', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,1000,Trabalho,Salário';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(1);
        expect(transactions[0].desc).toBe('Salário');
    });

    it('should assign correct userId to all transactions', async () => {
        const csv = 'data,tipo,valor,categoria,descricao\n09/03/2026,entrada,1000,Trabalho,Salário';
        const filePath = saveFile(csv, TEST_USER_ID);
        const job = await importJobRepository.create({ userId: TEST_USER_ID, filePath });

        await processImportJob({ jobId: job.id, filePath });

        const transactions = await transactionRepository.getAll(TEST_USER_ID);
        expect(transactions).toHaveLength(1);
        expect(transactions[0].userId).toBe(TEST_USER_ID);
    });
});
