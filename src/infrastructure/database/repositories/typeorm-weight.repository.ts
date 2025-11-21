import { Weight } from '@domain/entities/weight.entity';
import { IWeightRepository } from '@domain/repositories/weight.repository.interface';
import { WeightEntity } from '@infrastructure/database/entities/weight.entity';
import { Repository } from 'typeorm';

export class TypeORMWeightRepository implements IWeightRepository {
  constructor(private readonly repository: Repository<WeightEntity>) {}

  async findByPetId(petId: string): Promise<Weight[]> {
    const entities = await this.repository.find({
      where: { petId },
      order: { date: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(weight: Weight): Promise<Weight> {
    const entity = this.toEntity(weight);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: WeightEntity): Weight {
    return new Weight(entity.id, entity.petId, entity.weight, entity.date);
  }

  private toEntity(weight: Weight): WeightEntity {
    const entity = new WeightEntity();
    entity.id = weight.id;
    entity.petId = weight.petId;
    entity.weight = weight.weight;
    entity.date = weight.date;
    return entity;
  }
}
