import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { Book } from './book.entity';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { Contributor } from './contributor.entity';
import { ContributorController } from './contributor.controller';
import { ContributorService } from './contributor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      Contributor,
    ]),
  ],
  providers: [
    BookService,
    ContributorService,
  ],
  exports: [
    BookService,
    ContributorService,
  ],
  controllers: [
    BookController,
    ContributorController,
  ],
})
export class BookModule {}
