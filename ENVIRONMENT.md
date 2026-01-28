# Environment Configuration Guide

This project supports multiple environments: **development**, **staging**, and **production**.

## Environment Files

- `.env.development` - Development environment configuration
- `.env.staging` - Staging environment configuration
- `.env.production` - Production environment configuration
- `.env.example` - Template file with example values (safe to commit)

**Note:** The actual environment files (`.env.*`) are gitignored and should NOT be committed to version control.

## Setup Instructions

### 1. Create Environment Files

Copy the example file and create your environment-specific files:

```bash
# For development
cp .env.example .env.development

# For staging
cp .env.example .env.staging

# For production
cp .env.example .env.production
```

### 2. Configure Each Environment

Edit each `.env.*` file with the appropriate values for that environment:

- **Database URLs** - Update with environment-specific database hosts
- **Redis Configuration** - Set correct Redis host and credentials
- **JWT Secrets** - Use strong, unique secrets for each environment
- **AWS Credentials** - Configure environment-specific AWS access keys
- **S3 Bucket Names** - Use separate buckets per environment (e.g., `hi2-media-dev`, `hi2-media-staging`, `hi2-media-production`)
- **CORS Origins** - Set allowed origins for each environment

## Running the Application

### Development Mode (with watch)

```bash
npm run dev
# or
npm run dev:stage
npm run dev:prod
```

These commands run the application in watch mode (auto-restart on file changes) with the respective environment configuration.

### Production Mode (compiled)

First, build the application:

```bash
npm run build
```

Then start with the desired environment:

```bash
# Development
npm run start:dev

# Staging
npm run start:stage

# Production
npm run start:prod
```

## Available Scripts

| Script                | Description                              | Environment |
| --------------------- | ---------------------------------------- | ----------- |
| `npm run dev`         | Start development server with watch mode | development |
| `npm run dev:stage`   | Start staging server with watch mode     | staging     |
| `npm run dev:prod`    | Start production server with watch mode  | production  |
| `npm run start:dev`   | Start compiled app in development        | development |
| `npm run start:stage` | Start compiled app in staging            | staging     |
| `npm run start:prod`  | Start compiled app in production         | production  |
| `npm run build`       | Build the application                    | -           |

## Environment Variables Reference

### Core Configuration

- `NODE_ENV` - Environment name (development/staging/production)
- `PORT` - Server port (default: 3000)

### Database

- `DATABASE_URL` - PostgreSQL connection string

### Redis

- `REDIS_HOST` - Redis server host
- `REDIS_PORT` - Redis server port
- `REDIS_PASSWORD` - Redis password (optional)

### JWT

- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `JWT_ACCESS_EXPIRES_IN` - Access token expiration (e.g., 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (e.g., 7d)

### AWS S3

- `AWS_REGION` - AWS region (e.g., eu-central-1)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `S3_BUCKET` - S3 bucket name

### Server

- `CORS_ORIGIN` - Comma-separated list of allowed origins

## Best Practices

1. **Never commit** actual environment files (`.env.development`, `.env.staging`, `.env.production`)
2. **Use strong secrets** for JWT tokens in staging and production
3. **Use separate databases** for each environment
4. **Use separate S3 buckets** for each environment
5. **Rotate credentials** regularly in staging and production
6. **Document any new environment variables** in `.env.example`

## Troubleshooting

### Wrong environment loaded

- Check that `NODE_ENV` is set correctly in the npm script
- Verify the correct `.env.*` file exists
- Check console output for "Environment: ..." message on startup

### Environment variables not loading

- Ensure the `.env.*` file exists in the project root
- Check file permissions
- Verify no syntax errors in the environment file

### Database connection issues

- Verify `DATABASE_URL` is correct for the environment
- Check database server is running
- Verify network connectivity to database host
