import { Repository } from 'typeorm';
import { Pet } from '@domain/entities/pet.entity';
import { IPetRepository } from '@domain/repositories/pet.repository.interface';
import { PetEntity } from '@infrastructure/database/entities/pet.entity';

export class TypeORMPetRepository implements IPetRepository {
  constructor(private readonly repository: Repository<PetEntity>) {}

  async findById(id: string): Promise<Pet | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async save(pet: Pet): Promise<Pet> {
    const entity = this.toEntity(pet);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: PetEntity): Pet {
    return new Pet(entity.id, entity.name);
  }

  private toEntity(pet: Pet): PetEntity {
    const entity = new PetEntity();
    entity.id = pet.id;
    entity.name = pet.name;
    return entity;
  }
}
