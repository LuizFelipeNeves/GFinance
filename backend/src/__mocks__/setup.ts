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

const fileStorage = new Map<string, { content: string; stats?: { size: number } }>();

const fsMock = () => ({
    existsSync: vi.fn((path: string) => fileStorage.has(path)),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn((path: string, content: string) => {
        fileStorage.set(path, { content });
    }),
    readFileSync: vi.fn((path: string) => {
        const file = fileStorage.get(path);
        if (!file) throw new Error('File not found');
        return file.content;
    }),
    unlinkSync: vi.fn((path: string) => {
        fileStorage.delete(path);
    }),
    statSync: vi.fn((path: string) => {
        const file = fileStorage.get(path);
        if (!file) throw new Error('File not found');
        return { size: file.content.length };
    }),
    createReadStream: vi.fn((path: string) => {
        const file = fileStorage.get(path);
        if (!file) throw new Error('File not found');

        const { Readable } = require('stream');
        return Readable.from([file.content]);
    })
});

vi.mock('fs', () => ({
    __esModule: true,
    default: fsMock(),
    ...fsMock()
}));

vi.mock('../jobs/queue', () => ({
    getImportQueue: vi.fn(() => ({
        add: vi.fn().mockImplementation(async (name: string, data: { jobId: string; filePath: string }) => {
            const { processImportJob } = await import('../services/importService');
            await processImportJob(data);
            return { id: data.jobId };
        })
    }))
}));

vi.mock('bullmq', () => {
    return {
        __esModule: true,
        Queue: vi.fn().mockImplementation(() => ({
            add: vi.fn().mockResolvedValue({ id: 'mock-job-id', data: {} }),
            close: vi.fn().mockResolvedValue(undefined)
        })),
        Worker: vi.fn().mockImplementation(() => ({
            on: vi.fn(),
            close: vi.fn().mockResolvedValue(undefined)
        }))
    };
});

const createRepoMock = () => {
    const storage = new Map<string, Record<string, unknown>>();
    let idCounter = 1;

    return {
        storage,
        reset: () => { storage.clear(); idCounter = 1; },
        add: (item: Record<string, unknown>) => {
            const id = String(idCounter++);
            const newItem = { ...item, id };
            storage.set(id, newItem);
            return newItem;
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

beforeEach(async () => {
    jobRepo.reset();
    userRepo.reset();
    fileStorage.clear();
});

afterEach(async () => {
    vi.clearAllMocks();
});
