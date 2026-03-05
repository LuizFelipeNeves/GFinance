FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY index.html vite.config.ts tsconfig*.json ./

RUN npm run build

RUN npm ci --omit=dev

COPY dist ./dist

EXPOSE 3000

CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
