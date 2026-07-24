FROM node:24.15.0-slim@sha256:03eae3ef7e88a9de535496fb488d67e02b9d96a063a8967bae657744ecd513f2 AS builder

WORKDIR /app

COPY package*.json ./

RUN apt-get update -y && apt-get install -y openssl

RUN npm ci

COPY . .

RUN npm run db:generate
RUN npm run build
RUN npm prune --omit=dev


FROM node:24.15.0-slim@sha256:03eae3ef7e88a9de535496fb488d67e02b9d96a063a8967bae657744ecd513f2

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY package.json .

EXPOSE 4000

CMD ["node", "dist/server.js"]