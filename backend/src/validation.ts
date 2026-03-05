import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const transactionSchema = z.object({
    desc: z.string().min(1, 'Descrição é obrigatória'),
    cat: z.string().min(1, 'Categoria é obrigatória'),
    date: z.string().min(1, 'Data é obrigatória'),
    val: z.number({ message: 'Valor deve ser um número' }),
    type: z.enum(['in', 'out'], { message: 'Tipo deve ser "in" ou "out"' }),
});

export const transactionUpdateSchema = transactionSchema.partial();

export const importRowsSchema = z.array(z.object({
    descricao: z.string().optional(),
    categoria: z.string().optional(),
    data: z.string().optional(),
    valor: z.number().optional(),
    tipo: z.string().optional(),
    desc: z.string().optional(),
    cat: z.string().optional(),
    date: z.string().optional(),
    val: z.number().optional(),
    type: z.string().optional(),
}));

export const exportSchema = z.object({}).strict();

export const importStreamSchema = z.object({
    jobId: z.string().min(1, 'Job ID é obrigatório'),
});

export const dashboardSchema = z.object({
    period: z.enum(['monthly', 'quarterly', 'yearly']).optional().default('monthly'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
export type ImportRowsInput = z.infer<typeof importRowsSchema>;
export type ExportInput = z.infer<typeof exportSchema>;
export type ImportStreamInput = z.infer<typeof importStreamSchema>;
