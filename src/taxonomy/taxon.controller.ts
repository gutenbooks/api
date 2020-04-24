import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';

import { Taxon } from './taxon.entity';
import { TaxonService } from './taxon.service';

@Crud({
  model: {
    type: Taxon
  },
})
@Controller('taxons')
export class TaxonController implements CrudController<Taxon> {
  constructor(public service: TaxonService) {}
}
