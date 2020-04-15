import { Module } from '@nestjs/common';
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

import { GutenbergService } from './gutenberg.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
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
    GutenbergService,
    SeedService,
  ],
})
export class SeedModule {}
