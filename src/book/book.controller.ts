import { Controller, Get, UseInterceptors } from '@nestjs/common';
import {
  Crud,
  CrudController,
  ParsedRequest,
  CrudRequest,
  CrudRequestInterceptor,
} from '@nestjsx/crud';

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
      'editions.language': {
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

  @UseInterceptors(CrudRequestInterceptor)
  @Get('/search')
  async search(@ParsedRequest() req: CrudRequest) {
    // some awesome feature handling
    console.log(req.parsed);
    return this.service.getMany(req);
  }
}
