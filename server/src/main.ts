import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { promises } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const pkg = JSON.parse(await promises.readFile(join('.', 'package.json'), 'utf8'));

  const options = new DocumentBuilder().setTitle(pkg.name).setDescription(pkg.description).setVersion(pkg.version).addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
          persistAuthorization: true,
      },
  });

  await app.listen(3000);

  Logger.warn(`Application ${pkg.name}@${pkg.version} is running on ${process.env.NODE_ENV} mode: ${await app.getUrl()}`, 'Main');
}
bootstrap();
