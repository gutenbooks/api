import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { Language } from './language.entity';

@Injectable()
export class LanguageService extends TypeOrmCrudService<Language> {
  constructor(@InjectRepository(Language) repo) {
    super(repo);
  }
}
