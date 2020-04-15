import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';

import { Taxonomy } from './taxonomy.entity';
import { TaxonomyService } from './taxonomy.service';

@Crud({
  model: {
    type: Taxonomy
  },
  query: {
    join: {
      taxons: {
        eager: true,
      },
    },
  },
})
@Controller('taxonomies')
export class TaxonomyController implements CrudController<Taxonomy> {
  constructor(public service: TaxonomyService) {}
}
