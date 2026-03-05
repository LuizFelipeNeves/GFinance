import mongoose, { Schema, Document } from 'mongoose';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface UserWithPassword {
    password: string;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    },
    { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
