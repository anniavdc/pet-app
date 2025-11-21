import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('weight')
export class WeightEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'pet_id' })
  petId!: string;

  @Column({ type: 'float' })
  weight!: number;

  @Column({ type: 'date' })
  date!: Date;
}
