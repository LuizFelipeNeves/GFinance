FROM node:24-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm ci

COPY src/ ./src/

RUN npx tsc

RUN npm ci --only=production

EXPOSE 3001

CMD ["node", "dist/index.js"]
