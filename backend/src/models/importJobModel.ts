import mongoose, { Schema, Document } from 'mongoose';

export interface IImportJob extends Document {
    userId: string;
    filePath: string;
    status: 'processing' | 'complete';
    progress: number;
    total: number;
    imported?: number;
    createdAt: Date;
    updatedAt: Date;
}

const ImportJobSchema = new Schema<IImportJob>(
    {
        userId: { type: String, required: true },
        filePath: { type: String, required: true },
        status: { type: String, enum: ['processing', 'complete'], default: 'processing' },
        progress: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        imported: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const ImportJobModel = mongoose.model<IImportJob>('ImportJob', ImportJobSchema);
