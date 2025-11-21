import { Weight } from '@domain/entities/weight.entity';
import { AppDataSource } from '@infrastructure/database/data-source';
import { PetEntity } from '@infrastructure/database/entities/pet.entity';
import { WeightEntity } from '@infrastructure/database/entities/weight.entity';
import { TypeORMWeightRepository } from '@infrastructure/database/repositories/typeorm-weight.repository';

describe('TypeORMWeightRepository', () => {
  let repository: TypeORMWeightRepository;
  let testPetId: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create a test pet
    const petRepo = AppDataSource.getRepository(PetEntity);
    const pet = petRepo.create({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Pet',
    });
    await petRepo.save(pet);
    testPetId = pet.id;

    repository = new TypeORMWeightRepository(
      AppDataSource.getRepository(WeightEntity)
    );
  });

  afterAll(async () => {
    // Clean up
    await AppDataSource.getRepository(WeightEntity).query('DELETE FROM weight');
    await AppDataSource.getRepository(PetEntity).query('DELETE FROM pet');

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await AppDataSource.getRepository(WeightEntity).query('DELETE FROM weight');
  });

  describe('save', () => {
    it('should save and retrieve a weight', async () => {
      // Arrange
      const weight = Weight.create(testPetId, 25.5, new Date('2023-11-20'));

      const saved = await repository.save(weight);

      expect(saved.id).toBe(weight.id);
      expect(saved.weight).toBe(25.5);
      expect(saved.petId).toBe(testPetId);
    });
  });

  describe('findByPetId', () => {
    it('should find all weights for a pet', async () => {
      // Arrange
      const weight1 = Weight.create(testPetId, 25.0, new Date('2023-11-18'));
      const weight2 = Weight.create(testPetId, 26.0, new Date('2023-11-19'));

      await repository.save(weight1);
      await repository.save(weight2);

      const weights = await repository.findByPetId(testPetId);

      expect(weights).toHaveLength(2);
      expect(weights.map((w: Weight) => w.weight)).toContain(25.0);
      expect(weights.map((w: Weight) => w.weight)).toContain(26.0);
    });

    it('should return empty array when no weights found', async () => {
      const weights = await repository.findByPetId(
        '123e4567-e89b-12d3-a456-888888888888'
      );

      expect(weights).toEqual([]);
    });
  });
});
