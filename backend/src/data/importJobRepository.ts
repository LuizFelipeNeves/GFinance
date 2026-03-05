import { importJobs, type ImportJob } from '../mock';

export type ImportJobStatus = 'processing' | 'complete';

export interface CreateImportJobParams {
    userId: string;
    filePath: string;
}

export interface UpdateImportJobParams {
    status?: ImportJobStatus;
    progress?: number;
    total?: number;
    imported?: number;
}

class ImportJobRepository {
    create(params: CreateImportJobParams): ImportJob {
        const job: ImportJob = {
            id: `import-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            userId: params.userId,
            filePath: params.filePath,
            status: 'processing',
            progress: 0,
            total: 0
        };
        importJobs[job.id] = job;
        return job;
    }

    getById(id: string): ImportJob | undefined {
        return importJobs[id];
    }

    update(id: string, params: UpdateImportJobParams): ImportJob | undefined {
        const job = importJobs[id];
        if (!job) return undefined;

        if (params.status !== undefined) job.status = params.status;
        if (params.progress !== undefined) job.progress = params.progress;
        if (params.total !== undefined) job.total = params.total;
        if (params.imported !== undefined) job.imported = params.imported;

        return job;
    }

    delete(id: string): boolean {
        return delete importJobs[id];
    }

    getAll(): ImportJob[] {
        return Object.values(importJobs);
    }
}

export const importJobRepository = new ImportJobRepository();
