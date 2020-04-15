import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Book } from './book.entity';
import { EditionContribution } from './edition-contribution.entity';
import { Format } from './format.entity';
import { Identifier } from './identifier.entity';
import { Language } from '../language/language.entity';

@Entity()
export class Edition {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @ManyToOne(type => Book, book => book.editions)
  book: Promise<Book>;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle?: string;

  @ManyToOne(type => Language, { eager: true })
  language: Language;

  @Column()
  downloads: number;

  @OneToMany(type => EditionContribution, contribution => contribution.edition)
  contributions: Promise<EditionContribution[]>;

  @OneToMany(type => Format, format => format.edition, { eager: true })
  formats: Format[];

  @OneToMany(type => Identifier, identifier => identifier.edition, { eager: true })
  identifiers: Identifier[];

  @Column()
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
