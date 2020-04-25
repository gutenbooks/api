import {
  ChildEntity,
  Column,
  ManyToOne,
} from 'typeorm';

import { Identifier } from './identifier.entity';
import { Edition } from './edition.entity';

@ChildEntity('edition')
export class EditionIdentifier extends Identifier {
  @ManyToOne(type => Edition, edition => edition.identifiers, { 
    onDelete: 'CASCADE',
  })
  edition: Promise<Edition>;

  @Column()
  editionId: number;
}
