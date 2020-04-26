import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Edition } from './edition.entity';
import { BookContribution } from './book-contribution.entity';
import { BookIdentifier } from './book-identifier.entity';
import { Taxon } from '../taxonomy';

@Entity()
export class Book {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column()
  title: string;

  @Column({ type: 'longtext', nullable: true })
  subtitle: string|null;

  @Column({ type: 'longtext', default: '' })
  description: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  rating: string;

  @OneToMany(type => BookContribution, contribution => contribution.book, { eager: true })
  contributions: BookContribution[];

  @OneToMany(type => Edition, edition => edition.book)
  editions: Edition[];

  @OneToMany(type => BookIdentifier, identifier => identifier.book, {
    eager: true,
  })
  identifiers: BookIdentifier[];

  @ManyToMany(type => Taxon)
  @JoinTable()
  taxons: Taxon[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
