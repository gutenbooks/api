import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';

import { Language } from './language.entity';
import { LanguageService } from './language.service';

@Crud({
  model: {
    type: Language
  },
  query: {
    join: {
      taxons: {
        eager: true,
      },
    },
  },
})
@Controller('languages')
export class LanguageController implements CrudController<Language> {
  constructor(public service: LanguageService) {}
}
