import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './utility/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { winstonLoggerConfig } from './utility/logger/winston.logger';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true,
    },
    logger: WinstonModule.createLogger({
      instance: winstonLoggerConfig,
    }),
  });

  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('E-comm Api')
    .setDescription('Description here')
    .setVersion('1.0')
    .addServer('/api/v1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/api-docs', app, document);

  // Save OpenAPI JSON spec to file
  fs.writeFileSync('./openapi-spec.json', JSON.stringify(document));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(helmet());
  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(
    morgan('common', {
      stream: {
        write: (message) => winstonLoggerConfig.info(message.trim()),
      },
    }),
  );
  // app.useGlobalGuards(new RolesGuard(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
