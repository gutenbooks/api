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
import { Taxon } from '../taxonomy';

@Entity()
export class Book {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column()
  title: string;

  @Column({ type: 'longtext', nullable: true })
  subtitle: string|null;

  @OneToMany(type => BookContribution, contribution => contribution.book)
  contributions: Promise<BookContribution[]>;

  @OneToMany(type => Edition, edition => edition.book)
  editions: Edition[];

  @ManyToMany(type => Taxon)
  @JoinTable()
  taxons: Taxon[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
