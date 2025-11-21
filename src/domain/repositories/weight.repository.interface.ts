import { Weight } from '@domain/entities/weight.entity';

export interface IWeightRepository {
  findByPetId(petId: string): Promise<Weight[]>;
  save(weight: Weight): Promise<Weight>;
}
