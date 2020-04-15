import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Taxon } from './taxon.entity';
import { Taxonomy } from './taxonomy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Taxon,
      Taxonomy,
    ]),
  ],
  exports: [
    TypeOrmModule,
  ]
})
export class TaxonomyModule {}
