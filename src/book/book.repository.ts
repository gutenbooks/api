import { EntityRepository, Repository } from 'typeorm';
import { Book } from './book.entity';
import { IdentifierType, IdentifierSource } from './identifier.entity';

@EntityRepository(Book)
export class BookRepository extends Repository<Book> {

  findOneByBookIdentifier(source: IdentifierSource, type: IdentifierType, id: string): Promise<Book> {
    return this.createQueryBuilder('book')
      .leftJoinAndSelect('book.identifiers', 'identifier')
      .where('identifier.source = :source', { source })
      .where('identifier.type = :type', { type })
      .andWhere('identifier.value = :id', { id })
      .getOne()
    ;
  }

  findOneByEditionIdentifier(source: IdentifierSource, type: IdentifierType, id: string): Promise<Book> {
    return this.createQueryBuilder('book')
      .leftJoinAndSelect('book.editions', 'edition')
      .leftJoinAndSelect('edition.identifiers', 'identifier')
      .where('identifier.source = :source', { source })
      .where('identifier.type = :type', { type })
      .andWhere('identifier.value = :id', { id })
      .getOne()
    ;
  }

  findDuplicates(isExact: boolean = true): Promise<{ primaryId: number, ids: number[] }[]> {
    const query = this.createQueryBuilder('book')
      .select('book.id')
      .addSelect('GROUP_CONCAT(book.id)', 'duplicates')
      .leftJoinAndSelect('book.contributions', 'contribution')
      .where('book.title = book.title')
      .andWhere('contribution.contributorId = contribution.contributorId')
      .groupBy('book.title')
      .addGroupBy('contribution.contributorId')
      .having('count(book.id) > 1')
    ;

    if (isExact) {
      // we also need to group by subtitle as some authors have many
      // works with the same title, but different subtitles.
      // ex.
      //   - Viajes Por Filipinas : De Manila A Marianas
      //   - Viajes Por Filipinas : De Manila A Tayabas
      query
        .addGroupBy('book.subtitle')
      ;

    }

    return query.getRawMany().then((result) => {
      return result.map(d => {
        return {
          primaryId: parseInt(d.book_id, 10),
          ids: d.duplicates.split(',').map(id => parseInt(id, 10)),
        }
      });
    });
  }
}
