import { UserModel, type User } from '../models/userModel';

export type UserInput = Omit<User, 'id'>;

class UserRepository {
    async getAll(): Promise<User[]> {
        const docs = await UserModel.find().lean();
        return docs.map(this.toPlainUser);
    }

    async getById(id: string): Promise<User | undefined> {
        try {
            const doc = await UserModel.findById(id).lean();
            if (!doc) return;
            return this.toPlainUser(doc);
        } catch {
            return undefined;
        }
    }

    async getByEmail(email: string): Promise<User | undefined> {
        const doc = await UserModel.findOne({ email }).lean();
        if (!doc) return;
        return this.toPlainUser(doc);
    }

    async create(user: UserInput): Promise<User> {
        const doc = await UserModel.create(user);
        return this.toPlainUser(doc);
    }

    async validateCredentials(email: string, password: string): Promise<User | undefined> {
        const doc = await UserModel.findOne({ email, password }).lean();
        if (!doc) return;
        return this.toPlainUser(doc);
    }

    private toPlainUser(doc: { _id: { toString(): string } } & Omit<User, 'id'>): User {
        return {
            id: doc._id.toString(),
            name: doc.name,
            email: doc.email,
            password: doc.password
        };
    }
}

export const userRepository = new UserRepository();
