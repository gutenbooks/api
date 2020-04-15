import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Console, Command, createSpinner } from 'nestjs-console';

import { languages } from './languages.seed';

import {
 BookContribution,
 Book,
 Contributor,
 EditionContribution,
 Edition,
 Format,
 Identifier,
} from '../book';

import {
  Language,
} from '../language';

import {
 Taxon,
 Taxonomy,
} from '../taxonomy';

@Console({
    name: 'seed',
    description: 'Seed the project DB',
})
export class SeedService {

  public readonly spinner: any;

  constructor(
    @InjectRepository(BookContribution)
    protected readonly bookContributionRepository: Repository<BookContribution>,
    @InjectRepository(Book)
    protected readonly bookRepository: Repository<Book>,
    @InjectRepository(Contributor)
    protected readonly contributorRepository: Repository<Contributor>,
    @InjectRepository(EditionContribution)
    protected readonly editionContributionRepository: Repository<EditionContribution>,
    @InjectRepository(Edition)
    protected readonly editionRepository: Repository<Edition>,
    @InjectRepository(Format)
    protected readonly formatRepository: Repository<Format>,
    @InjectRepository(Identifier)
    protected readonly identifierRepository: Repository<Identifier>,
    @InjectRepository(Language)
    protected readonly languageRepository: Repository<Language>,
    @InjectRepository(Taxon)
    protected readonly taxonRepository: Repository<Taxon>,
    @InjectRepository(Taxonomy)
    protected readonly taxonomyRepository: Repository<Taxonomy>,
  ) {
    this.spinner = createSpinner();
  }

  @Command({
    command: 'all',
    description: 'Seed everything in the database',
  })
  async all(): Promise<void> {
    this.spinner.start(`full seed has begun`);
    await this.language();
    this.spinner.succeed(`full seed has finished`);
  }

  @Command({
    command: 'language',
    description: 'Seed languages in the database',
  })
  async language(): Promise<void> {
    this.spinner.start(`language seed begun`);

    // upsert each language
    for (const lang of languages) {
      let l = await this.languageRepository.findOne({ code: lang.code });

      if (!l) {
        l = new Language();
      }

      l.code = lang.code;
      l.name = lang.name;
      l.nativeName = lang.nativeName;

      await this.languageRepository.save(l);
    }

    this.spinner.succeed(`language seed complete`);
  }
}
