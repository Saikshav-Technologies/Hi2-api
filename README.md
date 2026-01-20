# Hi2 API

A robust, scalable backend API for the Hi2 social media platform built with NestJS, PostgreSQL, Redis, and Prisma ORM.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)

## 🎯 Overview

Hi2-API is a comprehensive backend service for a social media platform that provides authentication, user management, social interactions (posts, likes, comments, follows), event management, and file uploads. The API is built with modern best practices including JWT authentication, WebSocket support for real-time features, and cloud storage integration.

## 🛠 Technology Stack

### Core Framework
- **NestJS** (v10.3.0) - Progressive Node.js framework
- **TypeScript** (v5.3.3) - Type-safe JavaScript
- **Node.js** (v20+) - Runtime environment

### Database & ORM
- **PostgreSQL** (v16) - Primary database
- **Prisma** (v5.7.0) - Next-generation ORM
- **Redis** (v7) - Caching and session management

### Authentication & Security
- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication middleware
- **bcrypt** - Password hashing

### Cloud Services
- **AWS S3** - File storage and management
- **AWS SDK** (v3) - S3 client and presigned URLs

### Real-time Communication
- **Socket.IO** (v4.7.2) - WebSocket support
- **@nestjs/websockets** - NestJS WebSocket integration

### Validation & Transformation
- **class-validator** - DTO validation
- **class-transformer** - Object transformation
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Docker** - Containerization

## ✨ Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication (access & refresh tokens)
- Secure password hashing with bcrypt
- Token refresh mechanism
- Protected routes with guards

### User Management
- User profile creation and updates
- Profile customization (avatar, bio, username)
- Privacy settings (public/private accounts)
- User search and discovery

### Social Features
- **Posts**: Create, read, update, delete posts with optional images
- **Likes**: Like/unlike posts
- **Comments**: Comment on posts
- **Follows**: Follow/unfollow users
- **Feed**: Personalized feed based on followed users

### Event Management
- Create and manage events
- Event details (title, description, location, dates)
- Event images
- RSVP system (going, interested, not going)

### File Upload
- AWS S3 integration for file storage
- Presigned URL generation for secure uploads
- Support for images and other media

### Infrastructure
- Redis caching for improved performance
- WebSocket support for real-time features
- Docker containerization
- Health check endpoints
- Global exception handling
- Request validation and transformation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v16 or higher)
- **Redis** (v7 or higher)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **AWS Account** (for S3 file uploads)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Hi2-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hi_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET=hi2-uploads

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Configuration Files

The application uses a centralized configuration system located in `src/config/env.ts` that validates and exports all environment variables.

## 🗄️ Database Setup

### Local Development

1. **Start PostgreSQL** (if not using Docker):
   ```bash
   # Ensure PostgreSQL is running on port 5432
   ```

2. **Run Migrations**:
   ```bash
   npm run prisma:migrate
   ```

3. **Open Prisma Studio** (optional, for database GUI):
   ```bash
   npm run prisma:studio
   ```

### Database Schema

The database includes the following models:

- **User** - User accounts and profiles
- **RefreshToken** - JWT refresh tokens
- **Post** - User posts with content and images
- **Like** - Post likes
- **Comment** - Post comments
- **Follow** - User follow relationships
- **Event** - Events created by users
- **RSVP** - Event responses

See [prisma/schema.prisma](prisma/schema.prisma) for the complete schema definition.

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The API will be available at `http://localhost:4000` (or your configured PORT).

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## 📚 API Documentation

### Base URL

```
http://localhost:4000
```

### API Endpoints

#### Authentication (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

#### Users (`/users`)
- `GET /users/:id` - Get user profile
- `PATCH /users/:id` - Update user profile
- `GET /users/search` - Search users

#### Posts (`/posts`)
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create new post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

#### Comments (`/comments`)
- `GET /posts/:postId/comments` - Get post comments
- `POST /posts/:postId/comments` - Create comment
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

#### Likes (`/likes`)
- `POST /posts/:postId/like` - Like a post
- `DELETE /posts/:postId/like` - Unlike a post
- `GET /posts/:postId/likes` - Get post likes

#### Follows (`/follows`)
- `POST /users/:userId/follow` - Follow a user
- `DELETE /users/:userId/follow` - Unfollow a user
- `GET /users/:userId/followers` - Get user followers
- `GET /users/:userId/following` - Get user following

#### Feed (`/feed`)
- `GET /feed` - Get personalized feed

#### Events (`/events`)
- `GET /events` - Get all events
- `GET /events/:id` - Get event by ID
- `POST /events` - Create new event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

#### RSVPs (`/rsvps`)
- `POST /events/:eventId/rsvp` - RSVP to event
- `PATCH /rsvps/:id` - Update RSVP status
- `GET /events/:eventId/rsvps` - Get event RSVPs

#### Upload (`/upload`)
- `POST /upload/presigned-url` - Get presigned URL for S3 upload

#### Health Check
- `GET /health` - API health status

### Postman Collections

Pre-configured Postman collections are available in the `postman/` directory:
- [User-Controller.postman_collection.json](postman/User-Controller.postman_collection.json)
- [User-Registration.postman_collection.json](postman/User-Registration.postman_collection.json)

## 📁 Project Structure

```
Hi2-api/
├── prisma/
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Prisma schema definition
├── src/
│   ├── common/              # Shared utilities and modules
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Auth guards
│   │   ├── interceptors/    # Request/response interceptors
│   │   ├── prisma/          # Prisma service
│   │   └── redis/           # Redis service
│   ├── config/              # Configuration files
│   │   └── env.ts           # Environment configuration
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # User management
│   │   ├── posts/           # Posts module
│   │   ├── comments/        # Comments module
│   │   ├── likes/           # Likes module
│   │   ├── follows/         # Follow system
│   │   ├── feed/            # Feed generation
│   │   ├── events/          # Events module
│   │   ├── rsvps/           # RSVP system
│   │   └── upload/          # File upload module
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── app.module.ts        # Root application module
│   ├── app.controller.ts    # Root controller
│   └── main.ts              # Application entry point
├── postman/                 # Postman API collections
├── .env.example             # Environment variables template
├── .eslintrc.json           # ESLint configuration
├── .prettierrc.json         # Prettier configuration
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker image definition
├── nest-cli.json            # NestJS CLI configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 💻 Development

### Code Style

The project uses ESLint and Prettier for code quality and formatting:

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Available Scripts

```bash
npm run dev              # Start development server with watch mode
npm run build            # Build for production
npm run start:prod       # Start production server
npm run start:debug      # Start with debugging
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run end-to-end tests
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

### Adding New Features

1. Create a new module in `src/modules/`
2. Define DTOs for request/response validation
3. Create service layer for business logic
4. Implement controller with routes
5. Add module to `app.module.ts`
6. Update Prisma schema if database changes are needed
7. Run migrations: `npm run prisma:migrate`

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🐳 Docker Deployment

### Using Docker Compose

The project includes a complete Docker Compose setup with PostgreSQL, Redis, and the application.

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Services

- **app**: Hi2 backend API (port 3000)
- **postgres**: PostgreSQL database (port 5444)
- **redis**: Redis cache (port 6379)

### Environment Variables in Docker

The Docker Compose file provides sensible defaults for development. For production, override these values using a `.env` file or environment variables.

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Test Coverage

```bash
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Structure

Tests are located alongside their source files with the `.spec.ts` extension.

## 🔒 Security Considerations

- **JWT Secrets**: Always use strong, unique secrets in production
- **Password Hashing**: Passwords are hashed using bcrypt with salt rounds
- **CORS**: Configure `CORS_ORIGIN` to restrict API access
- **Environment Variables**: Never commit `.env` files to version control
- **AWS Credentials**: Use IAM roles in production instead of access keys
- **Input Validation**: All inputs are validated using class-validator
- **SQL Injection**: Prisma ORM provides protection against SQL injection

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Write or update tests as needed
4. Run linting and tests
5. Submit a pull request

## 📞 Support

For issues, questions, or contributions, please contact the development team.

---

**Built with ❤️ by the Hi2 Team**
