import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GFinance API',
            version: '1.0.0',
            description: 'API para gerenciamento de finanças pessoais',
            contact: {
                name: 'Luiz Felipe',
                email: 'androidfelipe23@gmail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Servidor de desenvolvimento',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Login: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'usuario@email.com' },
                        password: { type: 'string', format: 'password', example: '123456' },
                    },
                },
                Register: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'João Silva' },
                        email: { type: 'string', format: 'email', example: 'usuario@email.com' },
                        password: { type: 'string', format: 'password', example: '123456' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        token: { type: 'string', example: 'mock-jwt-token-123456' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: '1' },
                                name: { type: 'string', example: 'João Silva' },
                                email: { type: 'string', example: 'usuario@email.com' },
                            },
                        },
                        message: { type: 'string', example: 'Conta criada com sucesso' },
                    },
                },
                Transaction: {
                    type: 'object',
                    required: ['desc', 'cat', 'date', 'val', 'type'],
                    properties: {
                        id: { type: 'string', example: 't-123' },
                        desc: { type: 'string', example: 'Salário' },
                        cat: { type: 'string', example: 'Renda' },
                        date: { type: 'string', example: '01/03/2026' },
                        val: { type: 'number', example: 5000 },
                        type: { type: 'string', enum: ['in', 'out'], example: 'in' },
                    },
                },
                TransactionInput: {
                    type: 'object',
                    required: ['desc', 'cat', 'date', 'val', 'type'],
                    properties: {
                        desc: { type: 'string', example: 'Salário' },
                        cat: { type: 'string', example: 'Renda' },
                        date: { type: 'string', example: '01/03/2026' },
                        val: { type: 'number', example: 5000 },
                        type: { type: 'string', enum: ['in', 'out'], example: 'in' },
                    },
                },
                Dashboard: {
                    type: 'object',
                    properties: {
                        stats: {
                            type: 'object',
                            properties: {
                                balance: { type: 'object', properties: { old: { type: 'number' }, new: { type: 'number' } } },
                                income: { type: 'object', properties: { old: { type: 'number' }, new: { type: 'number' } } },
                                expenses: { type: 'object', properties: { old: { type: 'number' }, new: { type: 'number' } } },
                            },
                        },
                        transactions: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Transaction' },
                        },
                        summary: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    label: { type: 'string' },
                                    val: { type: 'number' },
                                },
                            },
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    message: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
        paths: {
            '/api/auth/login': {
                post: {
                    summary: 'Realizar login',
                    tags: ['Autenticação'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Login' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Login bem-sucedido',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            token: { type: 'string' },
                                            user: { type: 'object' },
                                        },
                                    },
                                },
                            },
                        },
                        401: {
                            description: 'Credenciais inválidas',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            '/api/auth/register': {
                post: {
                    summary: 'Registrar novo usuário',
                    tags: ['Autenticação'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Register' },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: 'Usuário criado com sucesso',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AuthResponse' },
                                },
                            },
                        },
                        400: {
                            description: 'E-mail já cadastrado',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            '/api/dashboard': {
                get: {
                    summary: 'Obter dados do dashboard',
                    tags: ['Dashboard'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Dados do dashboard',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Dashboard' } } },
                        },
                    },
                },
            },
            '/api/transactions': {
                get: {
                    summary: 'Listar transações',
                    tags: ['Transações'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'type', in: 'query', schema: { type: 'string', enum: ['all', 'in', 'out'] } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'category', in: 'query', schema: { type: 'string' } },
                        { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
                        { name: 'dateTo', in: 'query', schema: { type: 'string' } },
                    ],
                    responses: {
                        200: {
                            description: 'Lista de transações',
                        },
                    },
                },
                post: {
                    summary: 'Criar transação',
                    tags: ['Transações'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TransactionInput' },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: 'Transação criada',
                        },
                        400: {
                            description: 'Erro de validação',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                        },
                    },
                },
            },
            '/api/transactions/{id}': {
                put: {
                    summary: 'Atualizar transação',
                    tags: ['Transações'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TransactionInput' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Transação atualizada',
                        },
                    },
                },
                delete: {
                    summary: 'Excluir transação',
                    tags: ['Transações'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    ],
                    responses: {
                        200: {
                            description: 'Transação excluída',
                        },
                    },
                },
            },
            '/api/transactions/export': {
                get: {
                    summary: 'Exportar transações',
                    tags: ['Transações'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'type', in: 'query', schema: { type: 'string', enum: ['all', 'in', 'out'] } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'category', in: 'query', schema: { type: 'string' } },
                    ],
                    responses: {
                        200: {
                            description: 'Arquivo exportado',
                            content: { 'text/csv': {} },
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
