import type { Transaction } from '@/data/types';
import { GetAuthToken, SetAuthToken, SetAuthUser } from '@/utils/token';

const API_BASE = 'http://localhost:3001/api';

const getAuthHeaders = (): HeadersInit => {
    const token = GetAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export interface DashboardData {
    stats: {
        balance: { old: number; new: number };
        income: { old: number; new: number };
        expenses: { old: number; new: number };
    };
    transactions: Transaction[];
    summary: { label: string; val: number }[];
}

export interface TransactionsResponse {
    transactions: Transaction[];
    hasMore: boolean;
    page: number;
    total: number;
}

export interface TransactionFilters {
    page?: number;
    type?: string;
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    message?: string;
}

export interface ImportResponse {
    success: boolean;
    imported?: number;
    message: string;
    jobId?: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

const buildQueryString = (params: Record<string, string | number | undefined>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
};

export const api = {
    auth: {
        login: async (email: string, password: string): Promise<AuthResponse> => {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (data.token && data.user) {
                SetAuthToken(data.token);
                SetAuthUser(data.user);
            }
            return data;
        },
        register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (data.token && data.user) {
                SetAuthToken(data.token);
                SetAuthUser(data.user);
            }
            return data;
        }
    },

    dashboard: {
        get: async (): Promise<DashboardData> => {
            const response = await fetch(`${API_BASE}/dashboard`, {
                headers: getAuthHeaders(),
            });
            return response.json();
        },
    },

    transactions: {
        list: async (filters: TransactionFilters = {}): Promise<TransactionsResponse> => {
            const queryString = buildQueryString({
                page: filters.page || 1,
                type: filters.type || 'all',
                search: filters.search || '',
                category: filters.category || '',
                dateFrom: filters.dateFrom || '',
                dateTo: filters.dateTo || '',
            });
            const response = await fetch(`${API_BASE}/transactions?${queryString}`, {
                headers: getAuthHeaders(),
            });
            return response.json();
        },

        create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
            const response = await fetch(`${API_BASE}/transactions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(transaction),
            });
            return response.json();
        },

        update: async (id: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
            const response = await fetch(`${API_BASE}/transactions/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(transaction),
            });
            return response.json();
        },

        delete: async (id: string): Promise<{ success: boolean; id: string }> => {
            const response = await fetch(`${API_BASE}/transactions/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            return response.json();
        },

        import: async (rows: { descricao: string; categoria: string; data: string; valor: number; tipo: string }[]): Promise<ImportResponse> => {
            const response = await fetch(`${API_BASE}/transactions/import`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ rows }),
            });
            return response.json();
        },

        importFile: (file: File, onProgress?: (progress: UploadProgress) => void): Promise<ImportResponse> => {
            return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API_BASE}/transactions/import-file`);

                const token = GetAuthToken();
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable && onProgress) {
                        onProgress({
                            loaded: event.loaded,
                            total: event.total,
                            percent: Math.round((event.loaded / event.total) * 100),
                        });
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };

                xhr.onerror = () => reject(new Error('Upload failed'));
                xhr.send(formData);
            });
        },

        export: async (format: 'csv' | 'json' = 'csv', filters: Omit<TransactionFilters, 'page'> = {}): Promise<Response> => {
            const queryString = buildQueryString({
                format,
                type: filters.type || 'all',
                search: filters.search || '',
                category: filters.category || '',
            });
            return fetch(`${API_BASE}/transactions/export?${queryString}`, {
                headers: getAuthHeaders(),
            });
        },
    },
};
