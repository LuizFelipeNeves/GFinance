import mongoose, { Schema, Document } from 'mongoose';

export interface IImportJob extends Document {
    userId: string;
    filePath: string;
    status: 'processing' | 'complete' | 'failed';
    progress: number;
    total: number;
    imported?: number;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ImportJobSchema = new Schema<IImportJob>(
    {
        userId: { type: String, required: true },
        filePath: { type: String, required: true },
        status: { type: String, enum: ['processing', 'complete', 'failed'], default: 'processing' },
        progress: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        imported: { type: Number, default: 0 },
        error: { type: String }
    },
    { timestamps: true }
);

export const ImportJobModel = mongoose.model<IImportJob>('ImportJob', ImportJobSchema);
