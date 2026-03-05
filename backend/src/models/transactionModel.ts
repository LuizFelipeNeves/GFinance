import mongoose, { Schema, Document } from 'mongoose';

export interface Transaction {
    id: string;
    desc: string;
    cat: string;
    date: string;
    val: number;
    type: 'in' | 'out';
}

export interface ITransaction extends Document {
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
        desc: { type: String, required: true },
        cat: { type: String, required: true },
        date: { type: String, required: true },
        val: { type: Number, required: true },
        type: { type: String, enum: ['in', 'out'], required: true }
    },
    { timestamps: true }
);

export const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);
