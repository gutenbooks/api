import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { Book } from './book.entity';

@Injectable()
export class BookService extends TypeOrmCrudService<Book> {
  constructor(@InjectRepository(Book) repo) {
    super(repo);
  }
}
