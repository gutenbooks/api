import { EntityRepository, Repository } from 'typeorm';
import { Book } from './book.entity';
import { IdentifierType } from './identifier.entity';

@EntityRepository(Book)
export class BookRepository extends Repository<Book> {

  findOneByIdentifier(type: IdentifierType, id: string): Promise<Book> {
    return this.createQueryBuilder('book')
      .leftJoinAndSelect('book.editions', 'edition')
      .leftJoinAndSelect('edition.identifiers', 'identifier')
      .where(
        `
          identifier.type = :type
          AND identifier.value = :id
        `,
        { type, id }
      )
      .getOne()
    ;
  }
}
