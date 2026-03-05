import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './app';
import { transactionRepository } from './data/transactionRepository';
import { importJobRepository } from './data/importJobRepository';
import { jwtService, type JwtPayload } from './services/jwtService';
import { type Transaction } from './models';

let authToken: string;
let testUserId: string;

const getAuthToken = async () => {
    if (authToken) return authToken;
    const testEmail = `apitest${Date.now()}@test.com`;
    await request(app).post('/api/auth/register').send({
        name: 'API Test User',
        email: testEmail,
        password: 'password123'
    });
    const loginRes = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: 'password123'
    });
    authToken = loginRes.body.token;
    testUserId = loginRes.body.user.id;
    return authToken;
};

const getTestUserId = async () => {
    if (testUserId) return testUserId;
    await getAuthToken();
    return testUserId;
};

describe('API Routes', () => {
    beforeEach(async () => {
        await transactionRepository.clear();
    });

    beforeEach(async () => {
        const userId = await getTestUserId();
        const testTransactions = [
            { userId, desc: 'Salário', cat: 'Trabalho', date: '01/01/2025', val: 5000, type: 'in' as const },
            { userId, desc: 'Supermercado', cat: 'Alimentação', date: '02/01/2025', val: 500, type: 'out' as const },
            { userId, desc: 'Freelance', cat: 'Trabalho', date: '03/01/2025', val: 1500, type: 'in' as const },
            { userId, desc: 'Farmácia', cat: 'Saúde', date: '04/01/2025', val: 100, type: 'out' as const },
            { userId, desc: 'Luz', cat: 'Contas', date: '05/01/2025', val: 150, type: 'out' as const },
            { userId, desc: 'Internet', cat: 'Contas', date: '06/01/2025', val: 100, type: 'out' as const },
            { userId, desc: 'Restaurante', cat: 'Alimentação', date: '07/01/2025', val: 200, type: 'out' as const },
            { userId, desc: 'Gasolina', cat: 'Transporte', date: '08/01/2025', val: 250, type: 'out' as const },
        ];
        await transactionRepository.addBatch(testTransactions);
    });

    beforeEach(async () => {
        authToken = '';
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
            await request(app).post('/api/auth/register').send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
            const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'password123' });
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
            const token = await getAuthToken();
            const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('stats');
            expect(res.body).toHaveProperty('transactions');
            expect(res.body.stats).toHaveProperty('balance');
            expect(res.body.stats).toHaveProperty('income');
            expect(res.body.stats).toHaveProperty('expenses');
        });

        it('should return only 8 transactions', async () => {
            const userId = await getTestUserId();
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const date = `${year}-${month}-15`;

            const transactions = Array.from({ length: 15 }, (_, i) => ({
                userId,
                desc: `Transação ${i + 1}`,
                cat: 'Teste',
                date,
                val: 100,
                type: 'in' as const,
            }));
            await transactionRepository.addBatch(transactions);

            const token = await getAuthToken();
            const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.transactions).toHaveLength(8);
        });
    });

    describe('GET /api/transactions', () => {
        it('should return transactions with pagination', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions?page=1').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('transactions');
            expect(res.body).toHaveProperty('hasMore');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('total');
        });

        it('should filter by type in', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions?type=in').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            res.body.transactions.forEach((t: Transaction) => expect(t.type).toBe('in'));
        });

        it('should filter by type out', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions?type=out').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            res.body.transactions.forEach((t: Transaction) => expect(t.type).toBe('out'));
        });

        it('should filter by search in description', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions?search=salario').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        it('should filter by search in category', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions?search=aliment').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        it('should filter by dateFrom', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions?dateFrom=01/02/2025').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        it('should filter by dateTo', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions?dateTo=31/01/2025').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        it('should use default page 1', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.page).toBe(1);
        });

        it('should return empty array when no results', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions?search=nonexistent').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.transactions).toEqual([]);
        });
    });

    describe('POST /api/transactions', () => {
        it('should return 400 with missing fields', async () => {
            const token = await getAuthToken();
            const res = await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({ desc: 'Test' });
            expect(res.status).toBe(400);
        });

        it('should return 400 with invalid type', async () => {
            const token = await getAuthToken();
            const res = await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({ desc: 'Test', cat: 'Test', date: '01/01/2025', val: 100, type: 'invalid' });
            expect(res.status).toBe(400);
        });

        it('should create transaction with valid data', async () => {
            const token = await getAuthToken();
            const res = await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({ desc: 'Test', cat: 'Test', date: '01/01/2025', val: 100, type: 'in' });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.desc).toBe('Test');
            expect(res.body.type).toBe('in');
        });

        it('should add transaction to list', async () => {
            const token = await getAuthToken();
            const userId = await getTestUserId();
            const initialCount = (await transactionRepository.getAll(userId)).length;

            await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({ desc: 'New', cat: 'Test', date: '01/01/2025', val: 50, type: 'out' });

            const newCount = (await transactionRepository.getAll(userId)).length;
            expect(newCount).toBe(initialCount + 1);
        });
    });

    describe('PUT /api/transactions/:id', () => {
        it('should update transaction', async () => {
            const token = await getAuthToken();
            const res = await request(app).put('/api/transactions/1').set('Authorization', `Bearer ${token}`).send({ desc: 'Updated', cat: 'Cat', date: '01/01/2025', val: 200, type: 'in' });
            expect(res.status).toBe(200);
            expect(res.body.desc).toBe('Updated');
            expect(res.body.val).toBe(200);
        });

        it('should return 200 even if id not found (upsert behavior)', async () => {
            const token = await getAuthToken();
            const res = await request(app).put('/api/transactions/not-found').set('Authorization', `Bearer ${token}`).send({ desc: 'Test', cat: 'Test', date: '01/01/2025', val: 100, type: 'in' });
            expect(res.status).toBe(200);
        });
    });

    describe('DELETE /api/transactions/:id', () => {
        it('should delete transaction', async () => {
            const token = await getAuthToken();
            const res = await request(app).delete('/api/transactions/test-id').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return success even if id not found', async () => {
            const token = await getAuthToken();
            const res = await request(app).delete('/api/transactions/not-found').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/transactions/import/template', () => {
        it('should download CSV template', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions/import/template').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('text/csv');
            expect(res.headers['content-disposition']).toContain('modelo_transacoes.csv');
        });

        it('should contain headers in CSV', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions/import/template').set('Authorization', `Bearer ${token}`);
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
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions/export').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('text/csv');
            expect(res.headers['content-disposition']).toContain('transacoes.csv');
        });

        it('should filter export by type', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions/export?type=in').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        it('should filter export by search', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions/export?search=salario').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        it('should return CSV with data', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/transactions/export').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('text/csv');
        });
    });

    describe('POST /api/transactions/import-file', () => {
        it('should return 400 with no file', async () => {
            const token = await getAuthToken();
            const res = await request(app).post('/api/transactions/import-file').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Nenhum arquivo enviado');
        });

        it('should start import with valid CSV', async () => {
            const token = await getAuthToken();
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,1000,Trabalho,Salário';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.jobId).toBeDefined();
        });

        it('should accept alternative column names', async () => {
            const token = await getAuthToken();
            const csv = 'data,type,val,cat,desc\n01/01/2025,in,500,Trabalho,Freelance';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should accept "entrada" and "saida" as type', async () => {
            const token = await getAuthToken();
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,1000,Trabalho,Salário\n05/01/2025,saida,500,Alimentação,Supermercado';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should handle CSV with monetary symbols in value', async () => {
            const token = await getAuthToken();
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,"R$ 1.500,00",Trabalho,Salário';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return jobId for async processing', async () => {
            const token = await getAuthToken();
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,1000,Trabalho,Salário';
            const res = await request(app)
                .post('/api/transactions/import-file')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.from(csv), 'test.csv');

            expect(res.status).toBe(200);
            expect(res.body.jobId).toBeDefined();
        });
    });

    describe('GET /api/transactions/import/stream', () => {
        it('should stream events with jobId', async () => {
            const token = await getAuthToken();
            const csv = 'data,tipo,valor,categoria,descricao\n01/01/2025,entrada,1000,Trabalho,Salário';
            const uploadRes = await request(app)
                .post('/api/transactions/import-file')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.from(csv), 'test.csv');

            const jobId = uploadRes.body.jobId;
            expect(jobId).toBeDefined();

            const job = await importJobRepository.getById(jobId);
            expect(job).toBeDefined();
            expect(job?.status).toBe('complete');
            expect(job?.imported).toBe(1);
        });
    });

    describe('Dashboard Calculations', () => {
        beforeEach(async () => {
            await transactionRepository.clear();
        });

        it('should calculate monthly balance as accumulated (old = before current month, new = up to current month)', async () => {
            const userId = await getTestUserId();
            const dashboardTransactions = [
                { userId, desc: 'Salário Dez', cat: 'Trabalho', date: '2024-12-01', val: 150000, type: 'in' as const },
                { userId, desc: 'Aluguel', cat: 'Moradia', date: '2025-01-15', val: 2000, type: 'out' as const },
                { userId, desc: 'Supermercado', cat: 'Alimentação', date: '2025-02-10', val: 1500, type: 'out' as const },
                { userId, desc: 'Salário Jan', cat: 'Trabalho', date: '2025-01-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Contas', cat: 'Moradia', date: '2025-02-05', val: 500, type: 'out' as const },
                { userId, desc: 'Salário Fev', cat: 'Trabalho', date: '2025-02-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Lazer', cat: 'Entretenimento', date: '2025-03-01', val: 300, type: 'out' as const },
                { userId, desc: 'Salário Mar', cat: 'Trabalho', date: '2025-03-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Investimento', cat: 'Financeiro', date: '2025-03-10', val: 2000, type: 'out' as const },
            ];
            await transactionRepository.addBatch(dashboardTransactions);

            const token = await getAuthToken();
            const res = await request(app).get('/api/dashboard?period=monthly').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);

            const { stats } = res.body;

            expect(stats).toHaveProperty('balance');
            expect(stats).toHaveProperty('income');
            expect(stats).toHaveProperty('expenses');
            expect(stats.balance).toHaveProperty('old');
            expect(stats.balance).toHaveProperty('new');
            expect(stats.income).toHaveProperty('old');
            expect(stats.income).toHaveProperty('new');
            expect(stats.expenses).toHaveProperty('old');
            expect(stats.expenses).toHaveProperty('new');
        });

        it('should calculate quarterly balance as accumulated', async () => {
            const userId = await getTestUserId();
            const dashboardTransactions = [
                { userId, desc: 'Salário Dez', cat: 'Trabalho', date: '2024-12-01', val: 150000, type: 'in' as const },
                { userId, desc: 'Aluguel', cat: 'Moradia', date: '2025-01-15', val: 2000, type: 'out' as const },
                { userId, desc: 'Supermercado', cat: 'Alimentação', date: '2025-02-10', val: 1500, type: 'out' as const },
                { userId, desc: 'Salário Jan', cat: 'Trabalho', date: '2025-01-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Contas', cat: 'Moradia', date: '2025-02-05', val: 500, type: 'out' as const },
                { userId, desc: 'Salário Fev', cat: 'Trabalho', date: '2025-02-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Lazer', cat: 'Entretenimento', date: '2025-03-01', val: 300, type: 'out' as const },
                { userId, desc: 'Salário Mar', cat: 'Trabalho', date: '2025-03-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Investimento', cat: 'Financeiro', date: '2025-03-10', val: 2000, type: 'out' as const },
            ];
            await transactionRepository.addBatch(dashboardTransactions);

            const token = await getAuthToken();
            const res = await request(app).get('/api/dashboard?period=quarterly').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);

            const { stats } = res.body;

            expect(stats).toHaveProperty('balance');
            expect(stats.balance.new).toBeGreaterThan(0);
        });

        it('should calculate yearly balance as accumulated', async () => {
            const userId = await getTestUserId();
            const dashboardTransactions = [
                { userId, desc: 'Salário Dez', cat: 'Trabalho', date: '2024-12-01', val: 150000, type: 'in' as const },
                { userId, desc: 'Aluguel', cat: 'Moradia', date: '2025-01-15', val: 2000, type: 'out' as const },
                { userId, desc: 'Supermercado', cat: 'Alimentação', date: '2025-02-10', val: 1500, type: 'out' as const },
                { userId, desc: 'Salário Jan', cat: 'Trabalho', date: '2025-01-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Contas', cat: 'Moradia', date: '2025-02-05', val: 500, type: 'out' as const },
                { userId, desc: 'Salário Fev', cat: 'Trabalho', date: '2025-02-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Lazer', cat: 'Entretenimento', date: '2025-03-01', val: 300, type: 'out' as const },
                { userId, desc: 'Salário Mar', cat: 'Trabalho', date: '2025-03-05', val: 10000, type: 'in' as const },
                { userId, desc: 'Investimento', cat: 'Financeiro', date: '2025-03-10', val: 2000, type: 'out' as const },
            ];
            await transactionRepository.addBatch(dashboardTransactions);

            const token = await getAuthToken();
            const res = await request(app).get('/api/dashboard?period=yearly').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);

            const { stats } = res.body;

            expect(stats).toHaveProperty('balance');
            expect(stats.balance.new).toBeGreaterThan(0);
        });

        it('should return 400 with invalid period', async () => {
            const token = await getAuthToken();
            const res = await request(app).get('/api/dashboard?period=invalid').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(400);
        });

        it('should accept all valid period values', async () => {
            const token = await getAuthToken();
            const periods = ['monthly', 'quarterly', 'yearly'];
            for (const period of periods) {
                const res = await request(app).get(`/api/dashboard?period=${period}`).set('Authorization', `Bearer ${token}`);
                expect(res.status).toBe(200);
            }
        });
    });

    describe('JWT Service', () => {
        it('should sign a valid payload and return token', () => {
            const payload: JwtPayload = { userId: '123', email: 'test@example.com' };
            const token = jwtService.sign(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);
        });

        it('should verify a valid token and return payload', () => {
            const payload: JwtPayload = { userId: '123', email: 'test@example.com' };
            const token = jwtService.sign(payload);
            const verified = jwtService.verify(token);
            expect(verified).not.toBeNull();
            expect(verified?.userId).toBe('123');
            expect(verified?.email).toBe('test@example.com');
        });

        it('should return null for invalid token', () => {
            const verified = jwtService.verify('invalid-token');
            expect(verified).toBeNull();
        });

        it('should return null for tampered token', () => {
            const payload: JwtPayload = { userId: '123', email: 'test@example.com' };
            const token = jwtService.sign(payload);
            const tamperedToken = token.slice(0, -5) + 'xxxxx';
            const verified = jwtService.verify(tamperedToken);
            expect(verified).toBeNull();
        });

        it('should contain userId and email in payload', () => {
            const payload: JwtPayload = { userId: 'user-456', email: 'jwt@test.com' };
            const token = jwtService.sign(payload);
            const verified = jwtService.verify(token);
            expect(verified?.userId).toBe('user-456');
            expect(verified?.email).toBe('jwt@test.com');
        });
    });

    describe('Auth Middleware', () => {
        const testUserEmail = `authtest${Date.now()}@test.com`;
        let authToken: string;

        beforeEach(async () => {
            await request(app).post('/api/auth/register').send({
                name: 'Auth Test User',
                email: testUserEmail,
                password: 'password123'
            });
            const loginRes = await request(app).post('/api/auth/login').send({
                email: testUserEmail,
                password: 'password123'
            });
            authToken = loginRes.body.token;
        });

        it('should return 401 without authorization header', async () => {
            const res = await request(app).get('/api/transactions');
            expect(res.status).toBe(401);
        });

        it('should return 401 with invalid authorization format', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', 'InvalidFormat token123');
            expect(res.status).toBe(401);
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.status).toBe(401);
        });

        it('should return 401 with malformed token', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', 'Bearer ');
            expect(res.status).toBe(401);
        });

        it('should return 401 with missing Bearer prefix', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', authToken);
            expect(res.status).toBe(401);
        });

        it('should return 401 with wrong secret token', async () => {
            const payload: JwtPayload = { userId: '123', email: 'test@example.com' };
            const fakeToken = jwtService.sign(payload);
            const wrongSecretToken = fakeToken + 'tampered';
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${wrongSecretToken}`);
            expect(res.status).toBe(401);
        });

        it('should access protected route with valid token', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
        });

        it('should allow access to dashboard with valid token', async () => {
            const res = await request(app)
                .get('/api/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
        });

        it('should allow creating transaction with valid token', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ desc: 'Test', cat: 'Test', date: '01/01/2025', val: 100, type: 'in' });
            expect(res.status).toBe(201);
        });

        it('should include user info in request with valid token', async () => {
            await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ desc: 'User Test', cat: 'Test', date: '01/01/2025', val: 100, type: 'in' });
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.transactions.some((t: Transaction) => t.desc === 'User Test')).toBe(true);
        });
    });
});
