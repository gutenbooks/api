import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Taxon } from './taxon.entity';
import { Taxonomy } from './taxonomy.entity';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyController } from './taxonomy.controller';
import { TaxonService } from './taxon.service';
import { TaxonController } from './taxon.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Taxon,
      Taxonomy,
    ]),
  ],
  providers: [
    TaxonService,
    TaxonomyService,
  ],
  exports: [
    TypeOrmModule,
    TaxonomyService,
  ],
  controllers: [
    TaxonController,
    TaxonomyController,
  ],
})
export class TaxonomyModule {}
