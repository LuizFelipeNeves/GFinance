import { userRepository } from '../data/userRepository';
import { jwtService } from './jwtService';

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
    async login(input: LoginInput): Promise<AuthResult> {
        const user = await userRepository.validateCredentials(input.email, input.password);

        if (!user) {
            return { success: false, message: 'E-mail ou senha inválidos' };
        }

        const token = jwtService.sign({
            userId: user.id,
            email: user.email
        });

        return {
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    async register(input: RegisterInput): Promise<AuthResult> {
        const existingUser = await userRepository.getByEmail(input.email);

        if (existingUser) {
            return { success: false, message: 'E-mail já cadastrado' };
        }

        const newUser = await userRepository.create({
            name: input.name,
            email: input.email,
            password: input.password
        });

        const token = jwtService.sign({
            userId: newUser.id,
            email: newUser.email
        });

        return {
            success: true,
            message: 'Conta criada com sucesso',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        };
    }
}

export const authService = new AuthService();
