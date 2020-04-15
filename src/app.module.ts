import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedModule } from './seed/seed.module';
import { BookModule } from './book/book.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { LanguageModule } from './language/language.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ConsoleModule,

    SeedModule,
    BookModule,
    TaxonomyModule,
    LanguageModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}
