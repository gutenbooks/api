import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { Taxonomy } from './taxonomy.entity';

@Injectable()
export class TaxonomyService extends TypeOrmCrudService<Taxonomy> {
  constructor(@InjectRepository(Taxonomy) repo) {
    super(repo);
  }
}
