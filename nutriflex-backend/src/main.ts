import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DualJwtGuard } from './auth/dual-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import compression from 'compression';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
  // CORS configuration - allow frontend origins
  // For development, allow all localhost origins
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : isDevelopment
      ? true // Allow all origins in development
      : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4200', 'http://localhost:8080'];

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      exposedHeaders: ['Authorization'],
    },
  });

  // Register Express middleware BEFORE setGlobalPrefix so they apply to all routes (including /api/*)
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(typeof compression === 'function' ? compression() : (compression as { default: () => unknown }).default());
  
  // Configure helmet to not interfere with CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const usersService = app.get(UsersService);
  app.useGlobalGuards(new DualJwtGuard(jwtService, usersService, reflector));

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.use('/pdfs', express.static(join(__dirname, '..', 'pdfs')));

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          if (error.constraints) {
            return Object.values(error.constraints)[0];
          }
          return `${error.property} has invalid value`;
        });
        return new BadRequestException(messages);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nutriflex Backend API Documentation')
    .setDescription('Documentation for the Nutriflex Backend project APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  const port = Number(process.env.PORT) || 3000;
  try {
    await app.listen(port);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e?.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is already in use. Stop the other process or set PORT to a different value in .env (e.g. PORT=3001).`,
      );
      console.error(`Windows: netstat -ano | findstr :${port}  then  taskkill /PID <pid> /F`);
    }
    throw err;
  }
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api/swagger`);
}
bootstrap();
