import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from "class-transformer";

import { Book } from './book.entity';
import { EditionContribution } from './edition-contribution.entity';
import { Format } from './format.entity';
import { EditionIdentifier } from './edition-identifier.entity';
import { Language } from '../language/language.entity';

@Entity()
export class Edition {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Exclude()
  @Column()
  bookId: number;

  @ManyToOne(type => Book, book => book.editions)
  book: Promise<Book>;

  @Column()
  title: string;

  @Column({ type: 'longtext', nullable: true })
  subtitle: string|null;

  @Column()
  languageId: number;

  @ManyToOne(type => Language, { eager: true })
  language: Language;

  @Column()
  downloads: number;

  @OneToMany(type => EditionContribution, contribution => contribution.edition, {
    onDelete: 'CASCADE',
  })
  contributions: Promise<EditionContribution[]>;

  @OneToMany(type => Format, format => format.edition, {
    eager: true,
  })
  formats: Format[];

  @OneToMany(type => EditionIdentifier, identifier => identifier.edition, {
    eager: true,
  })
  identifiers: EditionIdentifier[];

  @Column()
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
