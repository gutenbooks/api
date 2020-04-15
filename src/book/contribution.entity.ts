import {
  Entity,
  TableInheritance,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Contributor } from './contributor.entity';

export enum ContributionType {
    AUTHOR = 'author',
    EDITOR = 'editor',
    ILLUSTRATOR = 'illustrator',
}

@Entity()
@TableInheritance({
  column: { type: 'varchar', name: 'work_type' }
})
export class Contribution {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ContributionType,
    })
    type: ContributionType;

    @Column()
    contributorId: number;

    @ManyToOne(type => Contributor, contributor => contributor.contributions, { eager: true })
    contributor: Contributor;

    @Column()
    priority: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
