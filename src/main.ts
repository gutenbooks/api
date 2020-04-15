import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CrudConfigService } from '@nestjsx/crud';

CrudConfigService.load({
  routes: {
    only: [
      'getManyBase',
      'getOneBase',
    ],
  },
  query: {
    limit: 50,
    maxLimit: 200,
    alwaysPaginate: true,
  },
});

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Gutenbooks API')
    .setDescription('Gutenbooks API documentation')
    .setVersion('1.0')
    .addTag('gutenbooks')
    .build()
  ;
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
