import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './app.js';
import { transactionRepository } from './data/transactionRepository.js';
import { mockData, type Transaction } from './mock.js';

describe('TransactionRepository.filter', () => {
    const transactions: Transaction[] = [
        { id: '1', desc: 'Salário', cat: 'Trabalho', date: '01/01/2025', val: 5000, type: 'in' },
        { id: '2', desc: 'Supermercado', cat: 'Alimentação', date: '05/01/2025', val: 500, type: 'out' },
        { id: '3', desc: 'Freelance', cat: 'Trabalho', date: '10/01/2025', val: 1000, type: 'in' },
    ];

    it('should return all transactions with no filters', () => {
        const result = transactionRepository.filter({}, transactions);
        expect(result).toHaveLength(3);
    });

    it('should filter by type', () => {
        const result = transactionRepository.filter({ type: 'in' }, transactions);
        expect(result).toHaveLength(2);
        result.forEach(t => expect(t.type).toBe('in'));
    });

    it('should filter by search', () => {
        const result = transactionRepository.filter({ search: 'SALÁRIO' }, transactions);
        expect(result).toHaveLength(1);
        expect(result[0].desc).toBe('Salário');
    });

    it('should filter by dateFrom', () => {
        const result = transactionRepository.filter({ dateFrom: '05/01/2025' }, transactions);
        expect(result).toHaveLength(2);
    });

    it('should filter by dateTo', () => {
        const result = transactionRepository.filter({ dateTo: '05/01/2025' }, transactions);
        expect(result).toHaveLength(2);
    });

    it('should filter by date range', () => {
        const result = transactionRepository.filter({ dateFrom: '02/01/2025', dateTo: '09/01/2025' }, transactions);
        expect(result).toHaveLength(1);
        expect(result[0].desc).toBe('Supermercado');
    });
});

describe('API Routes', () => {
    beforeEach(() => {
        mockData.transactions = mockData.transactions.slice(0, 8);
    });

    describe('POST /api/auth/login', () => {
        it('should return 401 with invalid credentials', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'invalid@test.com', password: 'wrongpass' });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 with missing email', async () => {
            const res = await request(app).post('/api/auth/login').send({ password: '123456' });
            expect(res.status).toBe(400);
        });

        it('should return 400 with invalid email format', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: '123456' });
            expect(res.status).toBe(400);
        });

        it('should return 400 with short password', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: '123' });
            expect(res.status).toBe(400);
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'androidfelipe23@gmail.com', password: 'androidfelipe23@gmail.com' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user).toHaveProperty('name');
            expect(res.body.user).toHaveProperty('email');
        });
    });

    describe('POST /api/auth/register', () => {
        it('should return 400 with missing fields', async () => {
            const res = await request(app).post('/api/auth/register').send({ name: 'Test' });
            expect(res.status).toBe(400);
        });

        it('should return 400 with invalid email', async () => {
            const res = await request(app).post('/api/auth/register').send({ name: 'Test', email: 'invalid', password: '123456' });
            expect(res.status).toBe(400);
        });

        it('should return 400 with short password', async () => {
            const res = await request(app).post('/api/auth/register').send({ name: 'Test', email: 'test@test.com', password: '123' });
            expect(res.status).toBe(400);
        });

        it('should register successfully with valid data', async () => {
            const res = await request(app).post('/api/auth/register').send({ name: 'New User', email: `new${Date.now()}@test.com`, password: '123456' });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toHaveProperty('id');
        });
    });

    describe('GET /api/dashboard', () => {
        it('should return dashboard data', async () => {
            const res = await request(app).get('/api/dashboard');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('stats');
            expect(res.body).toHaveProperty('transactions');
            expect(res.body.stats).toHaveProperty('balance');
            expect(res.body.stats).toHaveProperty('income');
            expect(res.body.stats).toHaveProperty('expenses');
        });

        it('should return only 8 transactions', async () => {
            const res = await request(app).get('/api/dashboard');
            expect(res.status).toBe(200);
            expect(res.body.transactions).toHaveLength(8);
        });
    });

    describe('GET /api/transactions', () => {
        it('should return transactions with pagination', async () => {
            const res = await request(app).get('/api/transactions?page=1');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('transactions');
            expect(res.body).toHaveProperty('hasMore');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('total');
        });

        it('should filter by type in', async () => {
            const res = await request(app).get('/api/transactions?type=in');
            expect(res.status).toBe(200);
            res.body.transactions.forEach((t: Transaction) => expect(t.type).toBe('in'));
        });

        it('should filter by type out', async () => {
            const res = await request(app).get('/api/transactions?type=out');
            expect(res.status).toBe(200);
            res.body.transactions.forEach((t: Transaction) => expect(t.type).toBe('out'));
        });

        it('should filter by search in description', async () => {
            const res = await request(app).get('/api/transactions?search=salario');
            expect(res.status).toBe(200);
        });

        it('should filter by search in category', async () => {
            const res = await request(app).get('/api/transactions?search=aliment');
            expect(res.status).toBe(200);
        });

        it('should filter by dateFrom', async () => {
            const res = await request(app).get('/api/transactions?dateFrom=01/02/2025');
            expect(res.status).toBe(200);
        });

        it('should filter by dateTo', async () => {
            const res = await request(app).get('/api/transactions?dateTo=31/01/2025');
            expect(res.status).toBe(200);
        });

        it('should use default page 1', async () => {
            const res = await request(app).get('/api/transactions');
            expect(res.status).toBe(200);
            expect(res.body.page).toBe(1);
        });

        it('should return empty array when no results', async () => {
            const res = await request(app).get('/api/transactions?search=nonexistent');
            expect(res.status).toBe(200);
            expect(res.body.transactions).toEqual([]);
        });
    });

    describe('POST /api/transactions', () => {
        it('should return 400 with missing fields', async () => {
            const res = await request(app).post('/api/transactions').send({ desc: 'Test' });
            expect(res.status).toBe(400);
        });

        it('should return 400 with invalid type', async () => {
            const res = await request(app).post('/api/transactions').send({ desc: 'Test', cat: 'Test', date: '01/01/2025', val: 100, type: 'invalid' });
            expect(res.status).toBe(400);
        });

        it('should create transaction with valid data', async () => {
            const res = await request(app).post('/api/transactions').send({ desc: 'Test', cat: 'Test', date: '01/01/2025', val: 100, type: 'in' });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.desc).toBe('Test');
            expect(res.body.type).toBe('in');
        });

        it('should add transaction to list', async () => {
            const initialCount = mockData.transactions.length;

            await request(app).post('/api/transactions').send({ desc: 'New', cat: 'Test', date: '01/01/2025', val: 50, type: 'out' });

            expect(mockData.transactions.length).toBe(initialCount + 1);
            expect(mockData.transactions[0].desc).toBe('New');
        });
    });

    describe('PUT /api/transactions/:id', () => {
        it('should update transaction', async () => {
            const res = await request(app).put('/api/transactions/1').send({ desc: 'Updated', cat: 'Cat', date: '01/01/2025', val: 200, type: 'in' });
            expect(res.status).toBe(200);
            expect(res.body.desc).toBe('Updated');
            expect(res.body.val).toBe(200);
        });

        it('should return 200 even if id not found (upsert behavior)', async () => {
            const res = await request(app).put('/api/transactions/not-found').send({ desc: 'Test', cat: 'Test', date: '01/01/2025', val: 100, type: 'in' });
            expect(res.status).toBe(200);
        });
    });

    describe('DELETE /api/transactions/:id', () => {
        it('should delete transaction', async () => {
            const res = await request(app).delete('/api/transactions/test-id');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return success even if id not found', async () => {
            const res = await request(app).delete('/api/transactions/not-found');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/transactions/import/template', () => {
        it('should download CSV template', async () => {
            const res = await request(app).get('/api/transactions/import/template');
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('text/csv');
            expect(res.headers['content-disposition']).toContain('modelo_transacoes.csv');
        });

        it('should contain headers in CSV', async () => {
            const res = await request(app).get('/api/transactions/import/template');
            const csv = res.text;
            expect(csv).toContain('data');
            expect(csv).toContain('tipo');
            expect(csv).toContain('valor');
            expect(csv).toContain('categoria');
            expect(csv).toContain('descricao');
        });
    });

    describe('GET /api/transactions/export', () => {
        it('should export transactions as CSV', async () => {
            const res = await request(app).get('/api/transactions/export');
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('text/csv');
            expect(res.headers['content-disposition']).toContain('transacoes.csv');
        });

        it('should filter export by type', async () => {
            const res = await request(app).get('/api/transactions/export?type=in');
            expect(res.status).toBe(200);
        });

        it('should filter export by search', async () => {
            const res = await request(app).get('/api/transactions/export?search=salario');
            expect(res.status).toBe(200);
        });

        it('should return CSV with data', async () => {
            const res = await request(app).get('/api/transactions/export');
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('text/csv');
        });
    });

    describe('POST /api/transactions/import-file', () => {
        it('should return 400 with no file', async () => {
            const res = await request(app).post('/api/transactions/import-file');
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Nenhum arquivo enviado');
        });

        it('should start import with valid CSV', async () => {
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,1000,Trabalho,Salário';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.jobId).toBeDefined();
        });

        it('should accept alternative column names', async () => {
            const csv = 'data,type,val,cat,desc\n01/01/2025,in,500,Trabalho,Freelance';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should accept "entrada" and "saida" as type', async () => {
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,1000,Trabalho,Salário\n05/01/2025,saida,500,Alimentação,Supermercado';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should handle CSV with monetary symbols in value', async () => {
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,"R$ 1.500,00",Trabalho,Salário';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return jobId for async processing', async () => {
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,1000,Trabalho,Salário';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.jobId).toMatch(/^import-/);
        });
    });

    describe('GET /api/transactions/import/stream', () => {
        it('should stream events with jobId', async () => {
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,1000,Trabalho,Salário';
            const uploadRes = await request(app)
                .post('/api/transactions/import-file')
                .attach('file', Buffer.from(csv), 'test.csv');

            const jobId = uploadRes.body.jobId;
            expect(jobId).toBeDefined();

            const res = await request(app).get(`/api/transactions/import/stream?jobId=${jobId}`);
            expect(res.status).toBe(200);
        });
    });
});
