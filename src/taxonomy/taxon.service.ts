import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { Taxon } from './taxon.entity';

@Injectable()
export class TaxonService extends TypeOrmCrudService<Taxon> {
  constructor(@InjectRepository(Taxon) repo) {
    super(repo);
  }
}
