import {
  Entity,
  Column,
  Unique,
  TableInheritance,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Edition } from './edition.entity';

export enum IdentifierSource {
    GUTENBERG = 'project_gutenberg',
    GOODREADS = 'goodreads',
    GLOBAL = 'global',
}

export enum IdentifierType {
    ISBN = 'isbn',
    ISBN13 = 'isbn13',
    INTERNAL = 'internal',
}

@Entity()
@Unique([ 'entity_type', 'source', 'type', 'value'])
@TableInheritance({
  column: { type: 'varchar', name: 'entity_type' }
})
export class Identifier {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column({
      type: 'enum',
      enum: IdentifierSource,
  })
  source: IdentifierSource;

  @Column({
      type: 'enum',
      enum: IdentifierType,
  })
  type: IdentifierType;

  @Column()
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
