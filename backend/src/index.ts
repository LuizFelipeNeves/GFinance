import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import Papa from 'papaparse';
import { mockData, mockUsers, fetchMoreTransactions, importJobs, type Transaction } from './mock.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

interface TransactionFilters {
    type?: string;
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
}

// Helper to filter transactions
const filterTransactions = (transactions: Transaction[], filters: TransactionFilters): Transaction[] => {
    let filtered = [...transactions];

    if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.category) {
        filtered = filtered.filter(t =>
            t.cat.toLowerCase().includes(filters.category!.toLowerCase())
        );
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
            t.desc.toLowerCase().includes(searchLower)
        );
    }

    return filtered;
};

// Routes

// GET /api/dashboard - Dashboard data
app.get('/api/dashboard', (_req: Request, res: Response) => {
    res.json(mockData);
});

// POST /api/auth/login - Login
app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'E-mail ou senha inválidos'
        });
    }
});

// POST /api/auth/register - Register
app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const existingUser = mockUsers.find(u => u.email === email);

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'E-mail já cadastrado'
        });
    }

    const newUser = {
        id: String(mockUsers.length + 1),
        name,
        email,
        password
    };

    mockUsers.push(newUser);

    res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso',
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    });
});

// GET /api/transactions - List transactions with filters and pagination
app.get('/api/transactions', (req: Request, res: Response) => {
    const {
        page = 1,
        type = 'all',
        search = '',
        category = '',
        dateFrom = '',
        dateTo = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const filters: TransactionFilters = {
        type: type as string,
        search: search as string,
        category: category as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
    };

    let filteredTransactions = filterTransactions(mockData.transactions, filters);

    const pageSize = 10;
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    let hasMore = endIndex < filteredTransactions.length;

    if (pageNum === 1 && !search && !category && !dateFrom && !dateTo && type === 'all') {
        const moreTransactions = fetchMoreTransactions(1);
        mockData.transactions = [...mockData.transactions, ...moreTransactions];
        hasMore = true;
    }

    res.json({
        transactions: paginatedTransactions,
        hasMore,
        page: pageNum,
        total: filteredTransactions.length
    });
});

// POST /api/transactions - Add new transaction
app.post('/api/transactions', (req: Request, res: Response) => {
    const { desc, cat, date, val, type } = req.body;

    const newTransaction: Transaction = {
        id: `t-${Date.now()}`,
        desc,
        cat,
        date,
        val: parseFloat(val),
        type
    };

    mockData.transactions.unshift(newTransaction);

    res.status(201).json(newTransaction);
});

// PUT /api/transactions/:id - Update transaction
app.put('/api/transactions/:id', (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { desc, cat, date, val, type } = req.body;

    const index = mockData.transactions.findIndex(t => t.id === id);

    if (index !== -1) {
        mockData.transactions[index] = {
            id,
            desc,
            cat,
            date,
            val: parseFloat(val),
            type
        };
    }

    res.json({
        id,
        desc,
        cat,
        date,
        val: parseFloat(val),
        type
    });
});

// DELETE /api/transactions/:id - Delete transaction
app.delete('/api/transactions/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    mockData.transactions = mockData.transactions.filter(t => t.id !== id);

    res.json({ success: true, id });
});

// POST /api/transactions/import - Import transactions from CSV
app.post('/api/transactions/import', (req: Request, res: Response) => {
    const { rows } = req.body;

    if (rows && rows.length > 0) {
        const newTransactions: Transaction[] = rows.map((r: { descricao: string; categoria: string; data: string; valor: number; tipo: string }, i: number) => ({
            id: `t-import-${Date.now()}-${i}`,
            desc: r.descricao,
            cat: r.categoria,
            date: r.data,
            val: r.valor,
            type: r.tipo
        }));

        mockData.transactions = [...newTransactions, ...mockData.transactions];
    }

    res.json({
        success: true,
        imported: rows?.length || 0,
        message: `${rows?.length || 0} transações importadas com sucesso`
    });
});

// POST /api/transactions/import-file - Upload file and start processing
app.post('/api/transactions/import-file', upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Nenhum arquivo enviado'
        });
    }

    const jobId = `import-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    Papa.parse(req.file.buffer.toString('utf-8'), {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const rows = results.data as Record<string, string>[];

            importJobs[jobId] = {
                id: jobId,
                rows: rows || [],
                status: 'processing',
                progress: 0,
                total: rows?.length || 0
            };

            processImport(jobId);

            res.json({
                success: true,
                jobId,
                message: 'Importação iniciada'
            });
        },
        error: (error: Error) => {
            res.status(400).json({
                success: false,
                message: 'Erro ao ler arquivo: ' + error.message
            });
        }
    });
});

// Simulate processing and send SSE updates
const processImport = (jobId: string) => {
    const job = importJobs[jobId];
    if (!job) return;

    const total = job.rows.length;
    let processed = 0;

    const processNext = () => {
        if (processed >= total) {
            const newTransactions: Transaction[] = job.rows.map((r, i) => ({
                id: `t-import-${Date.now()}-${i}`,
                desc: (r.descricao as string) || (r.desc as string) || '',
                cat: (r.categoria as string) || (r.cat as string) || '',
                date: (r.data as string) || (r.date as string) || '',
                val: parseFloat(String(r.valor || r.val || 0)),
                type: ((r.tipo as string) || (r.type as string) || 'out') as 'in' | 'out'
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

// GET /api/transactions/import/stream - SSE for import progress
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
            message: job.status === 'complete'
                ? `${job.imported} transações importadas`
                : `Processando ${job.progress}%...`,
            imported: job.imported
        };

        res.write(`data: ${JSON.stringify(message)}\n\n`);

        if (job.status === 'complete') {
            clearInterval(interval);
            res.end();
        }
    }, 200);

    res.on('close', () => {
        clearInterval(interval);
    });
});

// GET /api/transactions/export - Export transactions
app.get('/api/transactions/export', (req: Request, res: Response) => {
    const { format = 'csv', type = 'all', search = '', category = '' } = req.query;

    const filters: TransactionFilters = {
        type: type as string,
        search: search as string,
        category: category as string,
        dateFrom: '',
        dateTo: ''
    };

    const filteredTransactions = filterTransactions(mockData.transactions, filters);

    if (format === 'csv') {
        const headers = ['data', 'tipo', 'valor', 'categoria', 'descricao'];
        const csvRows = filteredTransactions.map(t => [
            t.date,
            t.type,
            t.val.toString(),
            t.cat,
            `"${t.desc}"`
        ]);

        const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=transacoes.csv');
        res.send(csv);
    } else {
        res.json(filteredTransactions);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 GFinance API running on http://localhost:${PORT}`);
});
