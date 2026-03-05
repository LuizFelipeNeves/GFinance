import { mockUsers, type User } from '../mock';

class UserRepository {
    getAll(): User[] {
        return mockUsers;
    }

    getById(id: string): User | undefined {
        return mockUsers.find(u => u.id === id);
    }

    getByEmail(email: string): User | undefined {
        return mockUsers.find(u => u.email === email);
    }

    create(user: Omit<User, 'id'>): User {
        const newUser: User = {
            ...user,
            id: String(mockUsers.length + 1)
        };
        mockUsers.push(newUser);
        return newUser;
    }

    validateCredentials(email: string, password: string): User | undefined {
        return mockUsers.find(u => u.email === email && u.password === password);
    }
}

export const userRepository = new UserRepository();
