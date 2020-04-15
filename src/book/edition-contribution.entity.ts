import {
  ChildEntity,
  Column,
  ManyToOne,
} from 'typeorm';

import { Contribution } from './contribution.entity';
import { Edition } from './edition.entity';

@ChildEntity('edition')
export class EditionContribution extends Contribution {
    @ManyToOne(type => Edition, edition => edition.contributions, { eager: true })
    edition: Edition;
}
