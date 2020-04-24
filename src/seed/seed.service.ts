import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Console, Command, createSpinner } from 'nestjs-console';

import { languages } from './languages.seed';
import { GutenbergService } from './gutenberg.service';
import {
  Language,
} from '../language';

@Console({
    name: 'seed',
    description: 'Seed the project DB',
})
export class SeedService {

  public readonly spinner: any;

  constructor(
    protected readonly gutenbergService: GutenbergService,
    @InjectRepository(Language)
    protected readonly languageRepository: Repository<Language>,
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
    await this.gutenbergService.all();
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
