import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { config } from './config/env';

let cachedServer: ReturnType<typeof express> | null = null;

function configureApp(app: INestApplication) {
  // CORS
  app.enableCors(config.cors);

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
}

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  bootstrapLocal();
}

export default async function handler(req: Request, res: Response) {
  const server = await createServer();
  return server(req, res);
}
