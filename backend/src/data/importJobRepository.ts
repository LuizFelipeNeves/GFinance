import { ImportJobModel, type IImportJob } from '../models/importJobModel';

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

interface ImportJob {
    id: string;
    userId: string;
    filePath: string;
    status: ImportJobStatus;
    progress: number;
    total: number;
    imported?: number;
}

class ImportJobRepository {
    private toPlainJob(doc: IImportJob): ImportJob {
        return {
            id: doc._id.toString(),
            userId: doc.userId,
            filePath: doc.filePath,
            status: doc.status,
            progress: doc.progress,
            total: doc.total,
            imported: doc.imported
        };
    }

    async create(params: CreateImportJobParams): Promise<ImportJob> {
        const doc = await ImportJobModel.create({
            userId: params.userId,
            filePath: params.filePath,
            status: 'processing',
            progress: 0,
            total: 0
        });
        return this.toPlainJob(doc);
    }

    async getById(id: string): Promise<ImportJob | undefined> {
        try {
            const doc = await ImportJobModel.findById(id).lean();
            if (!doc) return;
            return this.toPlainJob(doc);
        } catch {
        }
    }

    async update(id: string, params: UpdateImportJobParams): Promise<ImportJob | undefined> {
        try {
            const updateData: Record<string, unknown> = {};
            if (params.status !== undefined) updateData.status = params.status;
            if (params.progress !== undefined) updateData.progress = params.progress;
            if (params.total !== undefined) updateData.total = params.total;
            if (params.imported !== undefined) updateData.imported = params.imported;

            const doc = await ImportJobModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).lean();
            if (!doc) return;
            return this.toPlainJob(doc);
        } catch {
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result = await ImportJobModel.findByIdAndDelete(id);
            return result !== null;
        } catch {
            return false;
        }
    }

    async getAll(): Promise<ImportJob[]> {
        const docs = await ImportJobModel.find().lean();
        return docs.map(this.toPlainJob);
    }
}

export const importJobRepository = new ImportJobRepository();
