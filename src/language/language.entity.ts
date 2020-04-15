import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Language {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  nativeName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
