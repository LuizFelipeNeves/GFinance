import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import Papa from 'papaparse';
import swaggerUi from 'swagger-ui-express';
import { mockData, mockUsers, fetchMoreTransactions, importJobs, type Transaction } from './mock.js';
import { validate } from './middleware/validate.js';
import { loginSchema, registerSchema, transactionSchema, transactionUpdateSchema } from './validation.js';
import { swaggerSpec } from './swagger.js';

export const app = express();
const upload = multer({ storage: multer.memoryStorage() });

export interface TransactionFilters {
    type?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

export const filterTransactions = (transactions: Transaction[], filters: TransactionFilters): Transaction[] => {
    let filtered = [...transactions];

    if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom.split('/').reverse().join('-'));
        filtered = filtered.filter(t => {
            const tDate = new Date(t.date.split('/').reverse().join('-'));
            return tDate >= fromDate;
        });
    }

    if (filters.dateTo) {
        const toDate = new Date(filters.dateTo.split('/').reverse().join('-'));
        filtered = filtered.filter(t => {
            const tDate = new Date(t.date.split('/').reverse().join('-'));
            return tDate <= toDate;
        });
    }

    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(t =>
            t.desc.toLowerCase().includes(searchLower) || t.cat.toLowerCase().includes(searchLower)
        );
    }

    return filtered;
};

const getRowValue = (row: Record<string, unknown>, ...keys: string[]): string => {
    for (const key of keys) {
        const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key);
        if (foundKey) return String(row[foundKey] || '').trim();
    }
    return '';
};

const parseType = (typeStr: string): 'in' | 'out' => {
    const normalized = typeStr.toLowerCase().trim();
    if (['in', 'entrada', 'receita', 'credito', 'income'].includes(normalized)) return 'in';
    return 'out';
};

const processImport = (jobId: string) => {
    const job = importJobs[jobId];
    if (!job) return;

    const total = job.rows.length;
    let processed = 0;

    const processNext = () => {
        if (processed >= total) {
            const newTransactions: Transaction[] = job.rows.map((r, i) => ({
                id: `t-import-${Date.now()}-${i}`,
                desc: getRowValue(r, 'descricao', 'desc', 'description'),
                cat: getRowValue(r, 'categoria', 'cat', 'category'),
                date: getRowValue(r, 'data', 'date'),
                val: parseFloat(getRowValue(r, 'valor', 'val', 'value').replace(/[R$\s.,]/g, '').replace(',', '.')) || 0,
                type: parseType(getRowValue(r, 'tipo', 'type'))
            }));

            mockData.transactions = [...newTransactions, ...mockData.transactions];

            job.status = 'complete';
            job.progress = 100;
            job.imported = newTransactions.length;
            return;
        }

        processed += 1;
        job.progress = Math.round((processed / total) * 100);

        setTimeout(processNext, 100);
    };

    setTimeout(processNext, 500);
};

export const setupRoutes = () => {
    app.use(cors());
    app.use(express.json());

    // Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req: Request, res: Response) => {
        res.json(swaggerSpec);
    });

    // Dashboard
    app.get('/api/dashboard', (_req: Request, res: Response) => {
        const recentTransactions = mockData.transactions.slice(0, 8);
        res.json({ ...mockData, transactions: recentTransactions });
    });

    // Auth - Login
    app.post('/api/auth/login', validate(loginSchema), (req: Request, res: Response) => {
        const { email, password } = req.body;
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
            res.json({ success: true, token: 'mock-jwt-token-' + Date.now(), user: { id: user.id, name: user.name, email: user.email } });
        } else {
            res.status(401).json({ success: false, message: 'E-mail ou senha inválidos' });
        }
    });

    // Auth - Register
    app.post('/api/auth/register', validate(registerSchema), (req: Request, res: Response) => {
        const { name, email, password } = req.body;
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) return res.status(400).json({ success: false, message: 'E-mail já cadastrado' });
        const newUser = { id: String(mockUsers.length + 1), name, email, password };
        mockUsers.push(newUser);
        res.status(201).json({ success: true, message: 'Conta criada com sucesso', token: 'mock-jwt-token-' + Date.now(), user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    });

    // Transactions - List
    app.get('/api/transactions', (req: Request, res: Response) => {
        const { page = 1, type = 'all', search = '', dateFrom = '', dateTo = '' } = req.query;
        const pageNum = parseInt(page as string);
        const filters: TransactionFilters = { type: type as string, search: search as string, dateFrom: dateFrom as string, dateTo: dateTo as string };
        let filteredTransactions = filterTransactions(mockData.transactions, filters);
        const pageSize = 10;
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
        const hasMore = endIndex < filteredTransactions.length;
        if (pageNum === 1 && !search && !dateFrom && !dateTo && type === 'all') {
            const moreTransactions = fetchMoreTransactions(1);
            mockData.transactions = [...mockData.transactions, ...moreTransactions];
        }
        res.json({ transactions: paginatedTransactions, hasMore, page: pageNum, total: filteredTransactions.length });
    });

    // Transactions - Create
    app.post('/api/transactions', validate(transactionSchema), (req: Request, res: Response) => {
        const { desc, cat, date, val, type } = req.body;
        const newTransaction: Transaction = { id: `t-${Date.now()}`, desc, cat, date, val: parseFloat(val), type };
        mockData.transactions.unshift(newTransaction);
        res.status(201).json(newTransaction);
    });

    // Transactions - Update
    app.put('/api/transactions/:id', validate(transactionUpdateSchema), (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { desc, cat, date, val, type } = req.body;
        const index = mockData.transactions.findIndex(t => t.id === id);
        if (index !== -1) mockData.transactions[index] = { id, desc, cat, date, val: parseFloat(val), type };
        res.json({ id, desc, cat, date, val: parseFloat(val), type });
    });

    // Transactions - Delete
    app.delete('/api/transactions/:id', (req: Request, res: Response) => {
        const { id } = req.params;
        mockData.transactions = mockData.transactions.filter(t => t.id !== id);
        res.json({ success: true, id });
    });

    // Import file
    app.post('/api/transactions/import-file', upload.single('file'), (req: Request, res: Response) => {
        if (!req.file) return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
        const jobId = `import-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        Papa.parse(req.file.buffer.toString('utf-8'), {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as Record<string, string>[];
                importJobs[jobId] = { id: jobId, rows: rows || [], status: 'processing', progress: 0, total: rows?.length || 0 };
                processImport(jobId);
                res.json({ success: true, jobId, message: 'Importação iniciada' });
            },
            error: (error: Error) => res.status(400).json({ success: false, message: 'Erro ao ler arquivo: ' + error.message })
        });
    });

    // Import stream (SSE)
    app.get('/api/transactions/import/stream', (req: Request, res: Response) => {
        const jobId = req.query.jobId as string;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        res.write(`data: ${JSON.stringify({ type: 'connected', jobId })}\n\n`);
        const interval = setInterval(() => {
            const job = importJobs[jobId];
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
            if (job.status === 'complete') { clearInterval(interval); res.end(); }
        }, 200);
        res.on('close', () => clearInterval(interval));
    });

    // Export
    app.get('/api/transactions/export', (req: Request, res: Response) => {
        const { type = 'all', search = '' } = req.query;
        const filters: TransactionFilters = { type: type as string, search: search as string, dateFrom: '', dateTo: '' };
        const filteredTransactions = filterTransactions(mockData.transactions, filters);
        const csvData = filteredTransactions.map(t => ({ data: t.date, tipo: t.type, valor: t.val, categoria: t.cat, descricao: t.desc }));
        const csv = Papa.unparse(csvData);
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=transacoes.csv');
        res.send(csv);
    });

    // Template
    app.get('/api/transactions/import/template', (_req: Request, res: Response) => {
        const headers = ['data', 'tipo', 'valor', 'categoria', 'descricao'];
        const examples = [['04/03/2026', 'entrada', '1500.00', 'Salário', 'Recebimento mensal']];
        const csv = Papa.unparse({ fields: headers, data: examples });
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=modelo_transacoes.csv');
        res.send(csv);
    });
};

setupRoutes();
