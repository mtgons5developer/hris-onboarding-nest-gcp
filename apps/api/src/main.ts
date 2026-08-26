import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { corsAllowlist, isAllowedCorsOrigin } from './cors-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const origins = corsAllowlist(process.env.CORS_ORIGINS);
  app.enableCors({
    origin: (origin, cb) => cb(null, isAllowedCorsOrigin(origin, origins)),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('HRIS + Onboarding API')
    .setDescription('Lab / portfolio NestJS API for employee onboarding cases.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}  (Swagger /api/docs)`);
}

bootstrap();
