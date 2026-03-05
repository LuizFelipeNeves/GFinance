import type { Request, Response } from 'express';
import { transactionService } from '../services/transactionService';
import { importJobRepository } from '../data/importJobRepository';
import { saveFile } from '../utils';
import { getImportQueue } from '../jobs';
import type { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware';

export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const type = (req.query.type as string) || 'all';
    const search = (req.query.search as string) || '';
    const dateFrom = (req.query.dateFrom as string) || '';
    const dateTo = (req.query.dateTo as string) || '';

    const result = await transactionService.getTransactions(userId, page, { type, search, dateFrom, dateTo });
    res.json({
        transactions: result.data,
        hasMore: result.hasMore,
        page: result.page,
        total: result.total
    });
});

export const createTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { desc, cat, date, val, type } = req.body as { desc: string; cat: string; date: string; val: string; type: 'in' | 'out' };
    const transaction = await transactionService.createTransaction({ userId, desc, cat, date, val: parseFloat(val), type });
    res.status(201).json(transaction);
});

export const updateTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const { desc, cat, date, val, type } = req.body as { desc: string; cat: string; date: string; val: string; type: 'in' | 'out' };
    const transaction = await transactionService.updateTransaction(id, userId, { desc, cat, date, val: parseFloat(val), type });
    res.json(transaction || { id, desc, cat, date, val, type });
});

export const deleteTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    await transactionService.deleteTransaction(id, userId);
    res.json({ success: true, id });
});

export const importFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
        return;
    }

    const userId = req.user?.userId || 'anonymous';
    const fileContent = req.file.buffer.toString('utf-8');
    const filePath = saveFile(fileContent, userId);

    const job = await importJobRepository.create({ userId, filePath });
    const queue = getImportQueue();
    await queue.add('import', { jobId: job.id, filePath });
    res.json({ success: true, jobId: job.id, message: 'Importação iniciada' });
});

export const getImportStream = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const jobId = req.query.jobId as string;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'connected', jobId })}\n\n`);

    const interval = setInterval(async () => {
        const job = await importJobRepository.getById(jobId, userId);

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
});

export const exportTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const type = (req.query.type as string) || 'all';
    const search = (req.query.search as string) || '';

    const csv = await transactionService.exportToCsv(userId, { type, search });

    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=transacoes.csv');
    res.send(csv);
});

export const getTemplate = (_req: Request, res: Response) => {
    const csv = transactionService.getTemplateCsv();

    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=modelo_transacoes.csv');
    res.send(csv);
};
