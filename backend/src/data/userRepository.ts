import { UserModel, type User, type UserWithPassword } from '../models/userModel';
import { hashService } from '../services/hashService';

export type UserInput = Omit<User, 'id'> & { password: string };

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
        const hashedPassword = await hashService.hash(user.password);
        const doc = await UserModel.create({ ...user, password: hashedPassword });
        return this.toPlainUser(doc);
    }

    async validateCredentials(email: string, password: string): Promise<User | undefined> {
        const doc = await UserModel.findOne({ email }).lean() as (UserWithPassword & { _id: { toString(): string } } & Omit<User, 'id'>) | null;
        if (!doc) return;

        const isValid = await hashService.compare(password, doc.password);
        if (!isValid) return;

        return this.toPlainUser(doc);
    }

    private toPlainUser(doc: { _id: { toString(): string } } & Omit<User, 'id'>): User {
        return {
            id: doc._id.toString(),
            name: doc.name,
            email: doc.email
        };
    }
}

export const userRepository = new UserRepository();
