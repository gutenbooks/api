import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
 BookContribution,
 Book,
 BookRepository,
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

import { GoodreadsService } from './goodreads.service';
import { GutenbergHelperService } from './gutenberg-helper.service';
import { GutenbergService } from './gutenberg.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      BookContribution,
      Book,
      BookRepository,
      Contributor,
      EditionContribution,
      Edition,
      Format,
      Identifier,

      Language,

      Taxon,
      Taxonomy,
    ]),
  ],
  providers: [
    GoodreadsService,
    GutenbergHelperService,
    GutenbergService,
    SeedService,
  ],
})
export class SeedModule {}
