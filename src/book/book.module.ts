import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { Book } from './book.entity';
import { BookController } from './book.controller';
import { BookService } from './book.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
    ]),
  ],
  providers: [
    BookService,
  ],
  exports: [
    BookService,
  ],
  controllers: [
    BookController,
  ],
})
export class BookModule {}
