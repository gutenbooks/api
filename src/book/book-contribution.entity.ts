import {
  ChildEntity,
  Column,
  ManyToOne,
} from 'typeorm';

import { Contribution } from './contribution.entity';
import { Book } from './book.entity';

@ChildEntity('book')
export class BookContribution extends Contribution {

  @Column()
  bookId: number;

  @ManyToOne(type => Book, book => book.contributions, {
    onDelete: 'CASCADE',
  })
  book: Promise<Book>;
}
