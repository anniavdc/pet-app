import { Pet } from '@domain/entities/pet.entity';

export interface IPetRepository {
  findById(id: string): Promise<Pet | null>;
  save(pet: Pet): Promise<Pet>;
}
