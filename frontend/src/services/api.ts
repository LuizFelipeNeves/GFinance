import type { Transaction } from '@/data/types';
import { GetAuthToken, SetAuthToken, SetAuthUser, RemoveAuthToken } from '@/utils/token';

export const API_BASE = '/api';

const handleUnauthorized = () => {
    RemoveAuthToken();
    window.location.href = '/login';
};

const fetchApi = async <T = unknown>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = GetAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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
            const data = await fetchApi<AuthResponse>(`${API_BASE}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            if (data.token && data.user) {
                SetAuthToken(data.token);
                SetAuthUser(data.user);
            }
            return data;
        },
        register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
            const data = await fetchApi<AuthResponse>(`${API_BASE}/auth/register`, {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            });
            if (data.token && data.user) {
                SetAuthToken(data.token);
                SetAuthUser(data.user);
            }
            return data;
        }
    },

    dashboard: {
        get: async (period: string = 'monthly'): Promise<DashboardData> => {
            return fetchApi(`${API_BASE}/dashboard?period=${period}`);
        },
    },

    transactions: {
        list: async (filters: TransactionFilters = {}): Promise<TransactionsResponse> => {
            const queryString = buildQueryString({
                page: filters.page || 1,
                type: filters.type || 'all',
                search: filters.search || '',
                dateFrom: filters.dateFrom || '',
                dateTo: filters.dateTo || '',
            });
            return fetchApi(`${API_BASE}/transactions?${queryString}`);
        },

        create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
            return fetchApi(`${API_BASE}/transactions`, {
                method: 'POST',
                body: JSON.stringify(transaction),
            });
        },

        update: async (id: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
            return fetchApi(`${API_BASE}/transactions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(transaction),
            });
        },

        delete: async (id: string): Promise<{ success: boolean; id: string }> => {
            return fetchApi(`${API_BASE}/transactions/${id}`, {
                method: 'DELETE',
            });
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
                    if (xhr.status === 401) {
                        handleUnauthorized();
                        reject(new Error('Unauthorized'));
                    } else if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };

                xhr.onerror = () => reject(new Error('Upload failed'));
                xhr.send(formData);
            });
        },

        export: async (): Promise<Response> => {
            const response = await fetch(`${API_BASE}/transactions/export`, {
                headers: { Authorization: `Bearer ${GetAuthToken()}` },
            });
            if (response.status === 401) {
                handleUnauthorized();
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        },

        downloadTemplate: async (): Promise<void> => {
            const response = await fetch(`${API_BASE}/transactions/import/template`, {
                headers: { Authorization: `Bearer ${GetAuthToken()}` },
            });
            if (response.status === 401) {
                handleUnauthorized();
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'modelo_transacoes.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
    },
};
