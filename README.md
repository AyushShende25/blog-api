# Blog API

A production-ready RESTful API for a blogging platform built with Node.js, Express, and PostgreSQL.

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js (>=24.12.0) |
| Framework | Express 5.x |
| Database | PostgreSQL 17 |
| ORM | Prisma 7.x |
| Queue/Cache | Redis + BullMQ |
| Authentication | JWT + bcryptjs |
| Validation | Zod |
| Email | Nodemailer |
| File Storage | AWS S3 + Coudfront | 
| Logging | Winston |
| Security | Helmet, CORS, HPP, express-rate-limit, sanitize-html |
| Formatter/Linter | Biome |
| Containerization | Docker |

## Features

### Authentication & Authorization
- User signup with email verification
- Login/logout with JWT access + refresh tokens
- Redis based refresh-token rotation
- Password reset via email
- Role-based access control (USER, ADMIN)
- Permission-based authorization system

### Posts
- Create, read, update, delete posts
- Draft/Published status management
- Auto-generated slugs
- SEO meta tags (title, description, OG image)
- Bookmark posts

### Content Management
- Categories and Tags
- Rich media uploads via presigned S3 URLs served via Cloudfront CDN
- Nested comments with replies

### Social Features
- Like posts
- Follow/unfollow users

### API Features
- Rate limiting
- Request sanitization
- Comprehensive error handling
- Request logging with Morgan

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # API server entry point
├── worker.ts              # Background job worker
├── config/
│   └── env.ts             # Environment validation
├── errors/                # Custom error classes
├── middleware/            # Express middleware
│   ├── authenticate.middleware.ts
│   ├── authorize.middleware.ts
│   ├── errorHandler.middleware.ts
│   └── morgan.middleware.ts
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   ├── users/             
│   ├── post/              
│   ├── categories/        
│   ├── tags/              
│   ├── comments/          
│   ├── likes/             
│   ├── media/             
├── authorization/         # RBAC permissions
├── jobs/                  # Background jobs
│   └── email/             # Email queue
├── libs/                  # Utilities
│   ├── db.ts              # Prisma client
│   ├── logger.ts          # Winston logger
│   ├── redis.ts           # Redis client
│   └── s3.ts               # S3 client
└── store/                 # In-memory stores
    └── refresh-token.store.ts
```

## Getting Started

### Prerequisites

- Node.js >= 24.15.0
- pnpm
- PostgreSQL 17
- Redis
- Docker & Docker Compose (for Docker setup)

### Option 1: Run with Docker

1. **Clone and install dependencies**

```bash
pnpm install
```

2. **Create environment file**

```bash
cp .env.example .env.docker
```

3. **Start infrastructure and build**

```bash
# Start database and redis
docker compose up -d db redis

# Run migrations (exec into container or locally)
docker compose exec api pnpm dlx prisma migrate dev

# Build and start all services
docker compose up -d --build
```

The API will be available at `http://localhost:4000`.

### Option 2: Run Locally (Without Docker)

1. **Install dependencies**

```bash
pnpm install
```

2. **Create environment file**

```bash
cp .env.example .env
```

3. **Start PostgreSQL and Redis**

```bash
# Using Docker only for infra
docker compose up -d db redis
```

4. **Run database migrations**

```bash
pnpm dlx prisma migrate dev
```

5. **Start the development server**

```bash
# API server
pnpm dev

# Background worker (in another terminal)
pnpm dev:worker
```

## License

MIT