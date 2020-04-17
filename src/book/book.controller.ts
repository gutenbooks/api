import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';

import { Book } from './book.entity';
import { BookService } from './book.service';

@Crud({
  model: {
    type: Book
  },
  query: {
    join: {
      editions: {
        eager: true,
      },
      'editions.identifiers': {
        eager: true,
      },
      'editions.formats': {
        eager: true,
      },
      contributions: {
        eager: true,
      },
      'contributions.contributor': {
        eager: true,
      },
    },
    sort: [
      {
        field: 'editions.downloads',
        order: 'DESC'
      },
    ],
  },
})
@Controller('books')
export class BookController implements CrudController<Book> {
  constructor(public service: BookService) {}
}
