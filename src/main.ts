import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { Request, Response } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { config } from './config/env';

let cachedServer: ReturnType<typeof express> | null = null;

function configureApp(app: INestApplication) {
  // CORS
  app.enableCors(config.cors);

  // Swagger/OpenAPI Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hi2 Social Media API')
    .setDescription('Complete API documentation for Hi2 social media platform')
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User profile and account management')
    .addTag('Posts', 'Create, read, update, and delete posts')
    .addTag('Comments', 'Post comments and replies')
    .addTag('Likes', 'Like and unlike posts')
    .addTag('Follows', 'Follow and unfollow users')
    .addTag('Feed', 'User feed and timeline')
    .addTag('Events', 'Event creation and management')
    .addTag('RSVPs', 'Event RSVP management')
    .addTag('Upload', 'File upload endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Hi2 API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
}

async function createServer() {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  configureApp(nestApp);
  await nestApp.init();

  cachedServer = expressApp;
  return expressApp;
}

async function bootstrapLocal() {
  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  configureApp(nestApp);

  const PORT = config.port;
  await nestApp.listen(PORT);

  console.log(`Hi2 backend running on port ${PORT}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
}

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  bootstrapLocal();
}

export default async function handler(req: Request, res: Response) {
  const server = await createServer();
  return server(req, res);
}
