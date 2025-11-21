import { Weight } from '@domain/entities/weight.entity';

export interface IWeightRepository {
  findById(id: string): Promise<Weight | null>;
  findByPetId(petId: string): Promise<Weight[]>;
  save(weight: Weight): Promise<Weight>;
}
