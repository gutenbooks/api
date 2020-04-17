import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Edition } from './edition.entity';

export enum IdentifierType {
    GUTENBERG = 'project_gutenberg',
    GOODREADS = 'goodreads',
    ISBN = 'isbn',
}

@Entity()
export class Identifier {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column({
      type: 'enum',
      enum: IdentifierType,
  })
  type: IdentifierType;

  @Column()
  value: string;

  @ManyToOne(type => Edition, edition => edition.identifiers, {
    onDelete: 'CASCADE',
  })
  edition: Promise<Edition>;

  @Column()
  editionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
