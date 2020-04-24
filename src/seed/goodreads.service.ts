import { Injectable, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
} from '../book';

import {
  Language,
} from '../language';

import {
 Taxon,
 Taxonomy,
} from '../taxonomy';

@Injectable()
@Console({
    name: 'seed:goodreads',
    description: 'Seed the project DB with Goodreads data',
})
export class GoodreadsService {
  public readonly spinner: any;

  constructor(
    protected readonly http: HttpService,
    protected readonly bookRepository: BookRepository,
    @InjectRepository(BookContribution)
    protected readonly bookContributionRepository: Repository<BookContribution>,
    @InjectRepository(Contributor)
    protected readonly contributorRepository: Repository<Contributor>,
    @InjectRepository(Edition)
    protected readonly editionRepository: Repository<Edition>,
    @InjectRepository(Identifier)
    protected readonly identifierRepository: Repository<Identifier>,
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
    this.spinner.start('Beginning Goodreads seed.');

    // This query will return a "book" from Goodreads, which
    // in our terms is only a single edition of a book.
    const GOODREADS_API_KEY = `eIju1CWjhLoOrVQxxDUF2A`;
    const title = 'Moby Dick';
    const author = 'Herman Melville';
    const url = `https://www.goodreads.com/book/title.xml`;

    const params = {
      key: GOODREADS_API_KEY,
      title,
      author,
    }

    try {
      const response = await this.http.get(url, {
        params,
        headers: {
          'Accept': 'application/xml',
          'Content-Type': 'application/xml; charset=utf-8',
        },
      }).toPromise();
      const xml = await parseStringPromise(response.data);
      console.log(xml.GoodreadsResponse.book);
    } catch (err) {
      console.log(err);
    }

    this.spinner.succeed('Finished Goodreads seed.');
  }
}
