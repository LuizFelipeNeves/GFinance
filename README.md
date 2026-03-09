# GFinance

Gerenciador financeiro pessoal com dashboard de transações.

## Tech Stack

**Backend**
- Node.js + TypeScript
- Express (API)
- MongoDB (dados)
- Redis + BullMQ (fila de processamento)
- Fast-CSV (Leitura do csv)
- JWT (autenticação)

**Frontend**
- React + TypeScript
- Vite
- TailwindCSS
- sonner (toasts)
- react-intersection-observer (Infinity Scroll)
- react-day-picker (selecao de datas)
- Recharts (gráficos)
- papaparse (validação do arquivo csv)

## Como Rodar

### Com Docker (recomendado)

```bash
# Subir todos os serviços
docker-compose up --build

# Serviços disponíveis
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - MongoDB: localhost:27017
# - Redis: localhost:6379
```

### Desenvolvimento Local

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Variáveis de Ambiente

Criar `.env` no backend:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/gfinance
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=sua-chave-secreta
LOG_LEVEL=info
```

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Criar conta |
| POST | /api/auth/login | Login |
| GET | /api/transactions | Listar transações |
| POST | /api/transactions | Criar transação |
| PUT | /api/transactions/:id | Atualizar transação |
| DELETE | /api/transactions/:id | Deletar transação |
| POST | /api/transactions/import | Importar CSV |
| GET | /api/transactions/import/stream | SSE - progresso da importação |
| GET | /api/transactions/export | Exportar CSV |
| GET | /api/dashboard | Dados do dashboard |

## Documentação da API

A API possui documentação via Swagger:

```
http://localhost:3001/api-docs
```

## Decisões Técnicas

- **Filas**: BullMQ para processamento assíncrono de imports CSV
- **SSE**: Server-Sent Events para atualização em tempo real do progresso de importação
- **Autenticação**: JWT com expiração de 7 dias
- **Validação**: Zod para schemas de entrada
- **CSV**: PapaParse para parsing, import processado em background
- **Rate Limiting**: 100 req/min global, 10 req/min em auth
- **Testes**: Vitest + Supertest (backend), Vitest (frontend)

## Futuro
- **Processamento com Stream**: Processar CSV em chunks para arquvos grandes
- **Armazenamento**: Upload de arquivos para S3/MinIO em vez de filesystem local
