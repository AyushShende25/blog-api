# STAGE-1 PNPM Setup
FROM node:22.16.0-slim@sha256:2f3571619daafc6b53232ebf2fcc0817c1e64795e92de317c1684a915d13f1a5 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies needed for build (Prisma needs openssl)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# STAGE-2 Dependencies installation
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# STAGE-3 Build application
FROM base AS build
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Generate Prisma client 
RUN pnpm dlx prisma generate

# Build the application
RUN pnpm run build

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R 1000:1000 logs

# STAGE-4 Production dependencies
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile --prod
RUN pnpm dlx prisma generate

# STAGE-5 Production stage with distroless image
FROM gcr.io/distroless/nodejs22-debian12

ENV NODE_ENV="production"

WORKDIR /usr/src/app

# Copy production node_modules (includes Prisma client)
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules

# Copy built application
COPY --from=build /usr/src/app/dist ./dist

# Copy package.json for any runtime needs
COPY --from=build /usr/src/app/package.json ./

# Copy logs directory with proper permissions
COPY --from=build --chown=1000:1000 /usr/src/app/logs ./logs

EXPOSE 4000

# Run as non-root user (distroless default)
USER 1000

# Run the application directly with node (no pnpm needed)
CMD ["dist/server.js"]