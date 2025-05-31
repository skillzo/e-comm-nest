import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './utility/filters/http-exception.filter';
import { RoleGuard } from './utility/guards/RoleGuard.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalGuards(new RoleGuard(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
