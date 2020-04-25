import {
  ChildEntity,
  Column,
  ManyToOne,
} from 'typeorm';

import { Identifier } from './identifier.entity';
import { Book } from './book.entity';

@ChildEntity('book')
export class BookIdentifier extends Identifier {
  @ManyToOne(type => Book, book => book.identifiers, {
    onDelete: 'CASCADE',
  })
  book: Promise<Book>;

  @Column()
  bookId: number;
}
