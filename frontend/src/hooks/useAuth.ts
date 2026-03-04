import { useMutation } from '@tanstack/react-query';
import { api, type AuthResponse } from '@/services/api';

export const useLogin = () => {
    return useMutation<AuthResponse, Error, { email: string; password: string }>({
        mutationFn: ({ email, password }) => api.auth.login(email, password),
    });
};

export const useRegister = () => {
    return useMutation<AuthResponse, Error, { name: string; email: string; password: string }>({
        mutationFn: ({ name, email, password }) => api.auth.register(name, email, password),
    });
};
