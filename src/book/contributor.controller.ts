import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';

import { Contributor } from './contributor.entity';
import { ContributorService } from './contributor.service';

@Crud({
  model: {
    type: Contributor
  },
  query: {
    join: {
      contributions: {
        eager: true,
      },
    },
  },
})
@Controller('contributors')
export class ContributorController implements CrudController<Contributor> {
  constructor(public service: ContributorService) {}
}
