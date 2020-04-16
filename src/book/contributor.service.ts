import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { Contributor } from './contributor.entity';

@Injectable()
export class ContributorService extends TypeOrmCrudService<Contributor> {
  constructor(@InjectRepository(Contributor) repo) {
    super(repo);
  }
}
