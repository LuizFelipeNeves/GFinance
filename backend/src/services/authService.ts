import { userRepository } from '../data/userRepository';

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface AuthResult {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    message?: string;
}

class AuthService {
    login(input: LoginInput): AuthResult {
        const user = userRepository.validateCredentials(input.email, input.password);

        if (!user) {
            return { success: false, message: 'E-mail ou senha inválidos' };
        }

        return {
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    register(input: RegisterInput): AuthResult {
        const existingUser = userRepository.getByEmail(input.email);

        if (existingUser) {
            return { success: false, message: 'E-mail já cadastrado' };
        }

        const newUser = userRepository.create({
            name: input.name,
            email: input.email,
            password: input.password
        });

        return {
            success: true,
            message: 'Conta criada com sucesso',
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        };
    }
}

export const authService = new AuthService();
