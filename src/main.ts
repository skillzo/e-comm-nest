import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './utility/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('E-comm Api')
    .setDescription('Description here')
    .setVersion('1.0')
    .addServer('/api/v1')
    .addBearerAuth() // if you're using JWT Auth
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
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());
  // app.useGlobalGuards(new RolesGuard(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
