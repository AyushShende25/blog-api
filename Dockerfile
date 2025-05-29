FROM node:22.16.0-slim@sha256:2f3571619daafc6b53232ebf2fcc0817c1e64795e92de317c1684a915d13f1a5 AS base

# PNPM Setup
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set Working dir
WORKDIR /usr/src/app

# Dependencies installation stage
FROM base AS deps
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# Build stage
FROM base AS build
COPY --chown=node:node . .
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Build the application
RUN pnpm run build

# Production stage
FROM node:22.16.0-slim@sha256:2f3571619daafc6b53232ebf2fcc0817c1e64795e92de317c1684a915d13f1a5

ENV NODE_ENV="production"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install only runtime dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node prisma ./prisma

RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Generate Prisma client
RUN pnpm dlx prisma generate

RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose port
EXPOSE 4000

CMD ["pnpm", "start"]