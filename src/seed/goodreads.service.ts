import { Injectable, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Console, Command, createSpinner } from 'nestjs-console';
import { parseStringPromise } from 'xml2js';

import {
 BookContribution,
 Book,
 BookRepository,
 Contributor,
 ContributionType,
 EditionContribution,
 Edition,
 Format,
 Identifier,
 IdentifierType,
 IdentifierSource,
 BookIdentifier,
 EditionIdentifier,
} from '../book';

import {
  Language,
} from '../language';

import {
 Taxon,
 Taxonomy,
} from '../taxonomy';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface GoodReadsData {
  isbn: string;
  isbn13: string;
  description: string;
  workId: string;
  rating: string|null;
}

@Injectable()
@Console({
    name: 'seed:goodreads',
    description: 'Seed the project DB with Goodreads data',
})
export class GoodreadsService {
  public readonly spinner: any;
  public static readonly GOODREADS_API_ENDPOINT = `https://www.goodreads.com/book/title.xml`;

  constructor(
    protected readonly http: HttpService,
    protected readonly connection: Connection,
    protected readonly bookRepository: BookRepository,
    @InjectRepository(BookContribution)
    protected readonly bookContributionRepository: Repository<BookContribution>,
    @InjectRepository(Contributor)
    protected readonly contributorRepository: Repository<Contributor>,
    @InjectRepository(Edition)
    protected readonly editionRepository: Repository<Edition>,
    @InjectRepository(BookIdentifier)
    protected readonly bookIdentifierRepository: Repository<BookIdentifier>,
    @InjectRepository(Taxon)
    protected readonly taxonRepository: Repository<Taxon>,
    @InjectRepository(Taxonomy)
    protected readonly taxonomyRepository: Repository<Taxonomy>,
  ) {
    this.spinner = createSpinner();
  }

  @Command({
    command: 'all',
    description: 'Seed the Goodreads data',
  })
  async all(): Promise<void> {
    if (!process.env.GOODREADS_API_KEY) {
      this.spinner.fail('You must set your GOODREADS_API_KEY env variable.');
      return;
    }

    const pageSize = 500;
    const count: number = await this.bookRepository.count();

    console.log(`
      \n\n\n
      *******************************
      *     Goodreads Data Seed     *
      *******************************

      You are beginning the Goodreads data seed. This process will make
      one API call to Goodreads per second. Each book requires one API call.
      This means that it will take quite some time for the seed to finish.

      Please be aware that making a large amount of requests to the Goodreads
      API you may run the risk of your API Key being denied access. Please read
      their API Guidelines and proceed at your own risk.

      ESTIMATE
      - records: ${count}
      - time: ${(count / 60 / 60).toFixed(0)}hrs ${(((count / 60 / 60) % 1) * 60).toFixed(0)}min
      \n\n\n
    `);
    const spinner = this.spinner.start('Beginning Goodreads seed.');

    for (let i = 1; i <= Math.ceil(count / pageSize); i++) {
      const books: Book[] = await this.bookRepository
        .createQueryBuilder('books')
        .leftJoinAndSelect('books.identifiers', 'identifier')
        .leftJoinAndSelect('books.contributions', 'contribution')
        .leftJoinAndSelect('contribution.contributor', 'contributor')
        .leftJoinAndSelect('books.editions', 'edition')
        .orderBy('edition.downloads', 'DESC')
        .skip(((i - 1) * pageSize))
        .take(pageSize)
        .getMany()
      ;

      for (const book of books) {
        spinner.text = `Fetching from Goodreads: ${book.title}`;

        const result = await this.getGoodReadsData(book);

        if (result == null) {
          continue;
        }

        const {
          workId,
          isbn,
          isbn13,
          description,
          rating,
        } = result;

        spinner.text = `Upserting identifiers for '${book.title}'`;
        await this.upsertBookIdentifier(
          IdentifierSource.GOODREADS,
          IdentifierType.INTERNAL,
          book.id,
          workId,
        )

        // because we can't really line up editions,
        // store the ISBN's at the book level for now.
        if (isbn) {
          await this.upsertBookIdentifier(
            IdentifierSource.GOODREADS,
            IdentifierType.ISBN,
            book.id,
            isbn,
          );
        }

        if (isbn13) {
          await this.upsertBookIdentifier(
            IdentifierSource.GOODREADS,
            IdentifierType.ISBN13,
            book.id,
            isbn13,
          );
        }

        spinner.text = `Saving attributes for '${book.title}'`;
        await this.bookRepository.createQueryBuilder('book')
          .update(Book)
          .set({
            description: description || '',
            rating: rating,
          })
          .where('id = :id', { id: book.id })
          .execute()
        ;
      }

      this.spinner.succeed('Finished Goodreads seed.');
    }
  }

  /**
   * This query will return a "book" from Goodreads, which
   * in our terms is only a single edition of a book.
   * only fetch one per second.
   *
   * @param  book [description]
   * @return      [description]
   */
  async getGoodReadsData(book: Book): Promise<GoodReadsData|null> {
    await sleep(1000);

    const params: any = {
      key: process.env.GOODREADS_API_KEY,
      title: book.title,
    }

    if (book.contributions.length > 0) {
      params.author = book.contributions[0].contributor.name;
    }

    try {
      const response = await this.http.get(GoodreadsService.GOODREADS_API_ENDPOINT, {
        params,
        headers: {
          'Accept': 'application/xml',
          'Content-Type': 'application/xml; charset=utf-8',
        },
      }).toPromise();
      const xml = await parseStringPromise(response.data);
      const goodreadsBook = xml.GoodreadsResponse.book[0];
      const work = goodreadsBook.work[0];

      const isbn = goodreadsBook.isbn[0];
      const isbn13 = goodreadsBook.isbn13[0];
      const description = goodreadsBook.description[0];
      const workId = work.id[0]['_'];
      const ratingsDist = work.rating_dist[0];
      const rating = this.calculateRating(ratingsDist);

      return {
        isbn,
        isbn13,
        description,
        workId,
        rating,
      };
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.error(`\nunable to find book: ${book.id}`);
      } else {
        console.error('\nfailed request', err);
      }

      return null;
    }
  }

  calculateRating(ratings: string): string {
    const ratingsRegex = /5:([\d]+)\|4:([\d]+)\|3:([\d]+)\|2:([\d]+)\|1:([\d]+)\|total:([\d]+)/;
    if (!ratingsRegex.test(ratings)) {
      return null;
    }

    const parsed = ratingsRegex.exec(ratings);

    if (!parsed || parsed.length < 6) {
      return null;
    }

    const five = (5 * parseInt(parsed[1], 10));
    const four = (4 * parseInt(parsed[2], 10));
    const three = (3 * parseInt(parsed[3], 10));
    const two = (2 * parseInt(parsed[4], 10));
    const one = (1 * parseInt(parsed[5], 10));
    const total = parseInt(parsed[6], 10);

    // don't divide by zero
    if (total === 0) {
      return null;
    }

    const avg = (five + four + three + two + one) / total;
    return avg.toFixed(2);
  }

  /**
   * for performance reasons drop into raw SQL
   * here so that we can perform an upsert.
   */
  async upsertBookIdentifier(
    source: IdentifierSource,
    type: IdentifierType,
    bookId: string|number,
    externalId: string|number,
  ) {
    return this.connection.query(`
      INSERT INTO identifier
        (
          entity_type,
          source,
          type,
          value,
          book_id
        )
      VALUES
        (
          'book',
          '${source}',
          '${type}',
          '${externalId}',
          '${bookId}'
        )
      ON DUPLICATE KEY UPDATE
        entity_type='book',
        source='${source}',
        type='${type}',
        value='${externalId}',
        book_id='${bookId}';
    `);
  }
}
