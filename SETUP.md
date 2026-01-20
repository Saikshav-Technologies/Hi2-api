# Hi2-API Setup Guide

This guide provides detailed step-by-step instructions for setting up the Hi2-API project from scratch, including first-time Docker configuration.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development Setup](#local-development-setup)
- [Docker Setup (First Time)](#docker-setup-first-time)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Before you begin, ensure you have the following installed on your system:

#### For Local Development:
- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **PostgreSQL** (v16 or higher) - [Download](https://www.postgresql.org/download/)
- **Redis** (v7 or higher) - [Download](https://redis.io/download/)

#### For Docker Development:
- **Docker Desktop** (latest version) - [Download](https://www.docker.com/products/docker-desktop/)
  - Includes Docker Engine and Docker Compose
  - Available for Windows, macOS, and Linux

#### Optional:
- **Git** - For cloning the repository
- **Postman** - For testing API endpoints
- **VS Code** - Recommended code editor

### Verify Installations

```bash
# Check Node.js version
node --version
# Should output: v20.x.x or higher

# Check npm version
npm --version
# Should output: v9.x.x or higher

# Check Docker version
docker --version
# Should output: Docker version 24.x.x or higher

# Check Docker Compose version
docker compose version
# Should output: Docker Compose version v2.x.x or higher
```

---

## Quick Start (Docker)

**Best for:** First-time setup, quick testing, or if you don't want to install PostgreSQL and Redis locally.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Hi2-api
```

### Step 2: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit the `.env` file with your preferred text editor:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (Docker will use these defaults)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/hi_db

# Redis (Docker will use these defaults)
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Secrets (CHANGE THESE!)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-me
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3 Configuration (Optional for now)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=hi2-uploads

# CORS
CORS_ORIGIN=http://localhost:3000
```

> ⚠️ **Important:** Change the JWT secrets to strong, random strings in production!

### Step 4: Build and Start with Docker

```bash
# Build and start all services (app, PostgreSQL, Redis)
docker compose up -d

# View logs to ensure everything started correctly
docker compose logs -f
```

### Step 5: Verify Setup

```bash
# Check if all containers are running
docker compose ps

# Test the API health endpoint
curl http://localhost:3000/health
```

**You're done!** The API is now running at `http://localhost:3000`

---

## Local Development Setup

**Best for:** Active development with hot-reload and debugging capabilities.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Hi2-api
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up PostgreSQL

#### Option A: Using Existing PostgreSQL Installation

1. Start PostgreSQL service
2. Create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hi_db;

# Exit psql
\q
```

#### Option B: Using Docker for PostgreSQL Only

```bash
# Start only PostgreSQL from docker-compose
docker compose up -d postgres

# PostgreSQL will be available at localhost:5444
```

### Step 4: Set Up Redis

#### Option A: Using Existing Redis Installation

```bash
# Start Redis service
redis-server
```

#### Option B: Using Docker for Redis Only

```bash
# Start only Redis from docker-compose
docker compose up -d redis

# Redis will be available at localhost:6379
```

### Step 5: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database (adjust if using different credentials)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hi_db

# If using Docker PostgreSQL (port 5444):
# DATABASE_URL=postgresql://postgres:postgres@localhost:5444/hi_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets
JWT_ACCESS_SECRET=dev-access-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3 (Optional - leave empty for local development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=hi2-uploads

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Step 6: Generate Prisma Client

```bash
npm run prisma:generate
```

### Step 7: Run Database Migrations

```bash
npm run prisma:migrate
```

### Step 8: Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000` (or your configured PORT).

---

## Docker Setup (First Time)

### Understanding the Docker Setup

The project uses Docker Compose to orchestrate three services:

1. **app** - The NestJS backend application
2. **postgres** - PostgreSQL database
3. **redis** - Redis cache

### Docker Compose File Structure

```yaml
services:
  app:          # NestJS application (port 3000)
  postgres:     # PostgreSQL database (port 5444 → 5432)
  redis:        # Redis cache (port 6379)
```

### Step-by-Step Docker Configuration

#### 1. Install Docker Desktop

- **Windows/Mac:** Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** Install Docker Engine and Docker Compose separately

After installation:
1. Start Docker Desktop
2. Ensure Docker is running (check system tray/menu bar)

#### 2. Verify Docker Installation

```bash
# Check Docker is running
docker --version
docker compose version

# Test Docker with hello-world
docker run hello-world
```

#### 3. Configure Docker Resources (Optional)

For better performance, adjust Docker Desktop settings:

1. Open Docker Desktop
2. Go to Settings → Resources
3. Recommended settings:
   - **CPUs:** 2-4 cores
   - **Memory:** 4-8 GB
   - **Swap:** 1-2 GB
   - **Disk:** 20+ GB

#### 4. Prepare Environment File

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your preferred editor
# Minimum required changes:
# - JWT_ACCESS_SECRET
# - JWT_REFRESH_SECRET
```

#### 5. Build Docker Images

```bash
# Build the application image
docker compose build

# This will:
# - Download Node.js base image
# - Install dependencies
# - Generate Prisma client
# - Build the NestJS application
```

#### 6. Start All Services

```bash
# Start all services in detached mode
docker compose up -d

# Expected output:
# ✔ Network hi2-api_default       Created
# ✔ Volume hi2-api_postgres-data  Created
# ✔ Container hi2-postgres        Started
# ✔ Container hi2-redis           Started
# ✔ Container hi2-backend         Started
```

#### 7. Monitor Startup

```bash
# View logs from all services
docker compose logs -f

# View logs from specific service
docker compose logs -f app

# Press Ctrl+C to stop viewing logs (services keep running)
```

#### 8. Verify Services are Running

```bash
# Check container status
docker compose ps

# Expected output:
# NAME            STATUS    PORTS
# hi2-backend     Up        0.0.0.0:3000->3000/tcp
# hi2-postgres    Up        0.0.0.0:5444->5432/tcp
# hi2-redis       Up        0.0.0.0:6379->6379/tcp
```

#### 9. Test the API

```bash
# Test health endpoint
curl http://localhost:3000/health

# Or open in browser:
# http://localhost:3000/health
```

### Docker Management Commands

```bash
# Start services
docker compose up -d

# Stop services (keeps data)
docker compose down

# Stop services and remove volumes (deletes data)
docker compose down -v

# Restart a specific service
docker compose restart app

# View logs
docker compose logs -f app

# Execute commands in running container
docker compose exec app npm run prisma:studio

# Rebuild after code changes
docker compose up -d --build

# Check resource usage
docker stats
```

### Docker Networking

The services communicate using Docker's internal network:

- **app** connects to **postgres** using hostname `postgres`
- **app** connects to **redis** using hostname `redis`
- Your host machine connects to services via exposed ports:
  - App: `localhost:3000`
  - PostgreSQL: `localhost:5444`
  - Redis: `localhost:6379`

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Application port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_HOST` | Redis hostname | `localhost` or `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | Strong random string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Strong random string |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `AWS_REGION` | AWS region for S3 | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `S3_BUCKET` | S3 bucket name | `hi2-uploads` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

### Generating Strong Secrets

```bash
# Generate random secrets (Linux/Mac)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Database Setup

### Using Prisma Migrations

#### View Current Migration Status

```bash
npm run prisma:migrate -- status
```

#### Apply Migrations

```bash
# Development (creates migration if needed)
npm run prisma:migrate

# Production (applies existing migrations)
npx prisma migrate deploy
```

#### Create New Migration

```bash
# After modifying schema.prisma
npx prisma migrate dev --name description_of_changes
```

#### Reset Database (Development Only)

```bash
# ⚠️ WARNING: This will delete all data!
npx prisma migrate reset
```

### Using Prisma Studio

Prisma Studio provides a GUI for viewing and editing database data:

```bash
# Start Prisma Studio
npm run prisma:studio

# Opens in browser at http://localhost:5555
```

### Manual Database Access

#### PostgreSQL (Docker)

```bash
# Connect to PostgreSQL container
docker compose exec postgres psql -U postgres -d hi_db

# Run SQL commands
\dt              # List tables
\d users         # Describe users table
SELECT * FROM "User" LIMIT 5;
\q               # Quit
```

#### PostgreSQL (Local)

```bash
# Connect to local PostgreSQL
psql -U postgres -d hi_db
```

---

## Verification

### 1. Check Service Health

```bash
# API health check
curl http://localhost:3000/health
# or http://localhost:4000/health for local dev

# Expected response:
# {"status":"ok"}
```

### 2. Test Database Connection

```bash
# Open Prisma Studio
npm run prisma:studio

# If it opens successfully, database connection is working
```

### 3. Test Redis Connection

```bash
# If using Docker
docker compose exec redis redis-cli ping
# Expected: PONG

# If using local Redis
redis-cli ping
# Expected: PONG
```

### 4. Test API Endpoints

Using curl:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

Or import the Postman collections from the `postman/` directory.

### 5. Check Logs

```bash
# Docker logs
docker compose logs -f app

# Look for:
# "Hi2 backend running on port 3000"
# "Environment: development"
```

---

## Troubleshooting

### Docker Issues

#### Problem: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Ensure Docker Desktop is running
# Windows/Mac: Check system tray/menu bar
# Linux: Start Docker service
sudo systemctl start docker
```

#### Problem: Port already in use

**Solution:**
```bash
# Find what's using the port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Stop the conflicting service or change PORT in .env
```

#### Problem: Containers won't start

**Solution:**
```bash
# View detailed logs
docker compose logs

# Remove all containers and volumes, start fresh
docker compose down -v
docker compose up -d
```

### Database Issues

#### Problem: "Can't reach database server"

**Solution:**
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check DATABASE_URL is correct in .env
# Ensure hostname matches your setup:
# - Docker: postgres
# - Local: localhost
```

#### Problem: Migration errors

**Solution:**
```bash
# Reset database (development only)
npx prisma migrate reset

# Or manually drop and recreate
docker compose exec postgres psql -U postgres -c "DROP DATABASE hi_db;"
docker compose exec postgres psql -U postgres -c "CREATE DATABASE hi_db;"
npm run prisma:migrate
```

### Redis Issues

#### Problem: Redis connection refused

**Solution:**
```bash
# Check Redis is running
docker compose ps redis

# Test connection
docker compose exec redis redis-cli ping

# Verify REDIS_HOST and REDIS_PORT in .env
```

### Application Issues

#### Problem: Module not found errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npm run prisma:generate
```

#### Problem: TypeScript compilation errors

**Solution:**
```bash
# Clean build
rm -rf dist
npm run build
```

### Getting Help

If you encounter issues not covered here:

1. Check the logs: `docker compose logs -f`
2. Verify all environment variables are set correctly
3. Ensure all prerequisites are installed and up to date
4. Try a clean restart: `docker compose down -v && docker compose up -d`
5. Contact the development team with:
   - Error messages
   - Steps to reproduce
   - Your environment (OS, Docker version, Node version)

---

## Next Steps

After successful setup:

1. ✅ Read the [README.md](README.md) for API documentation
2. ✅ Import Postman collections from `postman/` directory
3. ✅ Explore the API endpoints
4. ✅ Review the codebase structure in `src/`
5. ✅ Start building features!

---

**Happy Coding! 🚀**
