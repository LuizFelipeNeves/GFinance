import type { Request, Response } from 'express';
import { transactionService } from '../services/transactionService';
import { importJobRepository } from '../data/importJobRepository';
import { saveFile } from '../utils';

export const getTransactions = (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const type = (req.query.type as string) || 'all';
    const search = (req.query.search as string) || '';
    const dateFrom = (req.query.dateFrom as string) || '';
    const dateTo = (req.query.dateTo as string) || '';

    const result = transactionService.getTransactions(page, { type, search, dateFrom, dateTo });
    res.json({
        transactions: result.data,
        hasMore: result.hasMore,
        page: result.page,
        total: result.total
    });
};

export const createTransaction = (req: Request, res: Response) => {
    const { desc, cat, date, val, type } = req.body as { desc: string; cat: string; date: string; val: string; type: 'in' | 'out' };
    const transaction = transactionService.createTransaction({ desc, cat, date, val: parseFloat(val), type });
    res.status(201).json(transaction);
};

export const updateTransaction = (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { desc, cat, date, val, type } = req.body as { desc: string; cat: string; date: string; val: string; type: 'in' | 'out' };
    const transaction = transactionService.updateTransaction(id, { desc, cat, date, val: parseFloat(val), type });
    res.json(transaction || { id, desc, cat, date, val, type });
};

export const deleteTransaction = (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    transactionService.deleteTransaction(id);
    res.json({ success: true, id });
};

export const importFile = (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
        return;
    }

    const userId = 'anonymous';
    const fileContent = req.file.buffer.toString('utf-8');
    const filePath = saveFile(fileContent, userId);

    const job = importJobRepository.create({ userId, filePath });
    transactionService.processImport(job.id);
    res.json({ success: true, jobId: job.id, message: 'Importação iniciada' });
};

export const getImportStream = (req: Request, res: Response) => {
    const jobId = req.query.jobId as string;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'connected', jobId })}\n\n`);

    const interval = setInterval(() => {
        const job = importJobRepository.getById(jobId);

        if (!job) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Job não encontrado' })}\n\n`);
            clearInterval(interval);
            res.end();
            return;
        }

        const message = {
            type: job.status === 'complete' ? 'complete' : 'progress',
            progress: job.progress,
            imported: job.imported,
            message: job.status === 'complete' ? `${job.imported} transações importadas` : undefined
        };

        res.write(`data: ${JSON.stringify(message)}\n\n`);

        if (job.status === 'complete') {
            clearInterval(interval);
            res.end();
        }
    }, 200);

    res.on('close', () => clearInterval(interval));
};

export const exportTransactions = (_req: Request, res: Response) => {
    const csv = transactionService.exportToCsv();

    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=transacoes.csv');
    res.send(csv);
};

export const getTemplate = (_req: Request, res: Response) => {
    const csv = transactionService.getTemplateCsv();

    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=modelo_transacoes.csv');
    res.send(csv);
};
