import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Taxonomy } from './taxonomy.entity';

@Entity()
export class Taxon {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column()
  name: string;

  @ManyToOne(type => Taxonomy, taxonomy => taxonomy.taxons)
  taxonomy: Taxonomy;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
