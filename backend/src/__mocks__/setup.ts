import { vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDB, teardownTestDB, clearTestDB } from './testDb';

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await teardownTestDB();
});

beforeEach(async () => {
    await clearTestDB();
});

const fileStorage = new Map();

const fsMock = () => ({
    existsSync: vi.fn((path: string) => fileStorage.has(path)),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn((path: string, content: string) => {
        fileStorage.set(path, content);
    }),
    readFileSync: vi.fn((path: string) => {
        const content = fileStorage.get(path);
        if (!content) throw new Error('File not found');
        return content;
    }),
    unlinkSync: vi.fn((path: string) => {
        fileStorage.delete(path);
    })
});

vi.mock('fs', () => ({
    __esModule: true,
    default: fsMock(),
    ...fsMock()
}));

vi.mock('multer', async () => {
    const multer = await vi.importActual<typeof import('multer')>('multer');
    return multer;
});

let processImportJobFn: ((input: { jobId: string; filePath: string }) => Promise<void>) | null = null;

vi.mock('bullmq', () => {
    class MockQueue {
        add = vi.fn(async (name: string, data: { jobId: string; filePath: string }) => {
            const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const job = { id: jobId, data };

            if (processImportJobFn && name === 'import') {
                try {
                    await processImportJobFn(data);
                } catch (error) {
                    console.error('Error processing import job:', error);
                }
            }

            return job;
        });
        process = vi.fn();
        on = vi.fn();
        close = vi.fn(() => Promise.resolve());
    }

    class MockWorker {
        on = vi.fn();
        close = vi.fn(() => Promise.resolve());
    }

    return { __esModule: true, Queue: MockQueue, Worker: MockWorker };
});

const createRepoMock = () => {
    const storage = new Map<string, Record<string, unknown>>();
    let idCounter = 1;

    return {
        storage,
        reset: () => { storage.clear(); idCounter = 1; },
        add: (item: Record<string, unknown>) => {
            const id = String(idCounter++);
            storage.set(id, { ...item, id });
            return { ...item, id };
        },
        get: (id: string) => storage.get(id),
        all: () => Array.from(storage.values())
    };
};

const jobRepo = createRepoMock();
const importJobRepoMock = {
    create: vi.fn((params: Record<string, unknown>) => jobRepo.add({ ...params, status: 'processing', progress: 0, total: 0 })),
    getById: vi.fn((id: string) => jobRepo.get(id)),
    update: vi.fn((id: string, params: Record<string, unknown>) => {
        const job = jobRepo.get(id);
        if (!job) return;
        const updated = { ...job, ...params };
        jobRepo.storage.set(id, updated);
        return updated;
    }),
    delete: vi.fn((id: string) => jobRepo.storage.delete(id)),
    getAll: vi.fn(() => jobRepo.all())
};

const userRepo = createRepoMock();
const userRepoMock = {
    getAll: vi.fn(() => userRepo.all()),
    getById: vi.fn((id: string) => userRepo.get(id)),
    getByEmail: vi.fn((email: string) => userRepo.all().find(u => u.email === email)),
    create: vi.fn((user: Record<string, unknown>) => userRepo.add(user)),
    validateCredentials: vi.fn((email: string, password: string) => userRepo.all().find(u => u.email === email && u.password === password)),
    update: vi.fn()
};

vi.mock('../data/importJobRepository', () => ({ importJobRepository: importJobRepoMock }));
vi.mock('../data/userRepository', () => ({ userRepository: userRepoMock }));

beforeAll(async () => {
    try {
        const { processImportJob } = await import('../services/importService');
        processImportJobFn = processImportJob;
    } catch (e) {
        console.warn('Could not import processImportJob:', e);
    }
});

beforeEach(async () => {
    jobRepo.reset();
    userRepo.reset();
    fileStorage.clear();
});

afterEach(async () => {
    vi.clearAllMocks();
});
