# Quick Start - Environment Setup

## 🚀 Running Different Environments

### Development

```bash
npm run dev
```

### Staging

```bash
npm run dev:stage
```

### Production

```bash
npm run dev:prod
```

## 📋 What Was Created

1. **Environment Files:**
   - `.env.development` - Local development config
   - `.env.staging` - Staging environment config
   - `.env.production` - Production environment config
   - `.env.example` - Template (safe to commit)

2. **NPM Scripts Added:**
   - `npm run dev` - Development with watch mode
   - `npm run dev:stage` - Staging with watch mode
   - `npm run dev:prod` - Production with watch mode
   - `npm run start:dev` - Development (compiled)
   - `npm run start:stage` - Staging (compiled)
   - `npm run start:prod` - Production (compiled)

3. **Helper Script:**
   - `./switch-env.sh [dev|stage|prod]` - Copy environment config to `.env`

## ⚙️ Configuration

Each environment file includes:

- `NODE_ENV` - Environment identifier
- `DATABASE_URL` - Database connection
- `REDIS_HOST/PORT/PASSWORD` - Redis configuration
- `JWT_ACCESS_SECRET/REFRESH_SECRET` - JWT secrets
- `AWS_*` - AWS S3 credentials
- `S3_BUCKET` - Environment-specific bucket
- `CORS_ORIGIN` - Allowed origins

## 🔒 Security Notes

- All `.env.*` files are gitignored
- Update JWT secrets for staging/production
- Use separate AWS keys per environment
- Use different S3 buckets per environment

## 📖 Full Documentation

See [ENVIRONMENT.md](ENVIRONMENT.md) for complete details.
