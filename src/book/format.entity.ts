import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Edition } from './edition.entity';

export enum FormatType {
    EPUB = 'epub',
    KINDLE = 'kindle',
    PLAIN_TEXT = 'text',
    HTML = 'html',
    PDF = 'pdf',
}

@Entity()
export class Format {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column({
      type: 'enum',
      enum: FormatType,
  })
  type: FormatType;

  @Column()
  file: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(type => Edition, edition => edition.formats)
  edition: Edition;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  public static formatFromMime(mime: string): FormatType {
    switch(mime) {
      case 'application/x-mobipocket-ebook':
        return FormatType.KINDLE;
      case 'application/epub+zip':
        return FormatType.EPUB;
      case 'text/html':
        return FormatType.HTML;
      case 'text/plain':
        return FormatType.PLAIN_TEXT;
      case 'text/plain; charset=us-ascii':
        return FormatType.PLAIN_TEXT;
    }

    throw new Error(`Unkown mime type: ${mime}`);
  }
}
