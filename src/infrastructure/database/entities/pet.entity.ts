import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('pet')
export class PetEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;
}
