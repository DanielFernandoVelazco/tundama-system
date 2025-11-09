import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurar CORS para el frontend de React
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  console.log(`🚀 Backend running on: http://localhost:${port}`);
}
bootstrap();