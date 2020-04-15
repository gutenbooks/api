import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Taxon } from './taxon.entity';
import { Taxonomy } from './taxonomy.entity';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyController } from './taxonomy.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Taxon,
      Taxonomy,
    ]),
  ],
  providers: [
    TaxonomyService,
  ],
  exports: [
    TypeOrmModule,
    TaxonomyService,
  ],
  controllers: [
    TaxonomyController,
  ],
})
export class TaxonomyModule {}
