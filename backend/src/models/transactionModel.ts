import mongoose, { Schema, Document } from 'mongoose';

export interface Transaction {
    id: string;
    userId: string;
    desc: string;
    cat: string;
    date: string;
    val: number;
    type: 'in' | 'out';
}

export interface ITransaction extends Document {
    userId: string;
    desc: string;
    cat: string;
    date: string;
    val: number;
    type: 'in' | 'out';
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: String, required: true, index: true },
        desc: { type: String, required: true },
        cat: { type: String, required: true },
        date: { type: String, required: true },
        val: { type: Number, required: true },
        type: { type: String, enum: ['in', 'out'], required: true }
    },
    { timestamps: true }
);

TransactionSchema.index({ userId: 1, date: -1 });

export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
