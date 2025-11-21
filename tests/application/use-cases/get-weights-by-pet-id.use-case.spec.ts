import { GetWeightsByPetIdUseCase } from '@application/use-cases/get-weights-by-pet-id.use-case';
import { IPetRepository } from '@domain/repositories/pet.repository.interface';
import { IWeightRepository } from '@domain/repositories/weight.repository.interface';
import { Pet } from '@domain/entities/pet.entity';
import { Weight } from '@domain/entities/weight.entity';
import { NotFoundError } from '@domain/errors';

describe('GetWeightsByPetIdUseCase', () => {
  let useCase: GetWeightsByPetIdUseCase;
  let mockWeightRepository: jest.Mocked<IWeightRepository>;
  let mockPetRepository: jest.Mocked<IPetRepository>;

  beforeEach(() => {
    mockWeightRepository = {
      save: jest.fn(),
      findByPetId: jest.fn(),
    };

    mockPetRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    useCase = new GetWeightsByPetIdUseCase(mockWeightRepository, mockPetRepository);
  });

  describe('execute', () => {
    it('should return empty array when pet has no weights', async () => {
      // Arrange
      const petId = '018c8f8e-7b4a-7890-abcd-ef1234567890';
      const mockPet = Pet.create('Fluffy');
      mockPetRepository.findById.mockResolvedValue(mockPet);
      mockWeightRepository.findByPetId.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(petId);

      // Assert
      expect(result).toEqual([]);
      expect(mockPetRepository.findById).toHaveBeenCalledWith(petId);
      expect(mockWeightRepository.findByPetId).toHaveBeenCalledWith(petId);
    });

    it('should return array of weight DTOs when pet has weights', async () => {
      // Arrange
      const petId = '018c8f8e-7b4a-7890-abcd-ef1234567890';
      const mockPet = Pet.create('Fluffy');
      
      const weight1 = Weight.create(petId, 5.5, new Date('2024-01-15'));
      const weight2 = Weight.create(petId, 6.0, new Date('2024-02-15'));
      const weight3 = Weight.create(petId, 6.5, new Date('2024-03-15'));
      
      mockPetRepository.findById.mockResolvedValue(mockPet);
      mockWeightRepository.findByPetId.mockResolvedValue([weight1, weight2, weight3]);

      // Act
      const result = await useCase.execute(petId);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: weight1.id,
        weight: 5.5,
        date: expect.any(String),
        petId,
      });
      expect(result[1]).toEqual({
        id: weight2.id,
        weight: 6.0,
        date: expect.any(String),
        petId,
      });
      expect(result[2]).toEqual({
        id: weight3.id,
        weight: 6.5,
        date: expect.any(String),
        petId,
      });
      expect(mockPetRepository.findById).toHaveBeenCalledWith(petId);
      expect(mockWeightRepository.findByPetId).toHaveBeenCalledWith(petId);
    });

    it('should throw NotFoundError when pet does not exist', async () => {
      // Arrange
      const petId = '018c8f8e-7b4a-7890-abcd-ef1234567890';
      mockPetRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(petId)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(petId)).rejects.toThrow(`Pet with id ${petId} not found`);
      expect(mockPetRepository.findById).toHaveBeenCalledWith(petId);
      expect(mockWeightRepository.findByPetId).not.toHaveBeenCalled();
    });

    it('should map all weight properties correctly', async () => {
      // Arrange
      const petId = '018c8f8e-7b4a-7890-abcd-ef1234567890';
      const mockPet = Pet.create('Fluffy');
      const specificDate = new Date('2024-06-15T10:30:00.000Z');
      const weight = Weight.create(petId, 7.25, specificDate);
      
      mockPetRepository.findById.mockResolvedValue(mockPet);
      mockWeightRepository.findByPetId.mockResolvedValue([weight]);

      // Act
      const result = await useCase.execute(petId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(weight.id);
      expect(result[0].weight).toBe(7.25);
      expect(result[0].date).toBe(specificDate.toISOString().split('T')[0]);
      expect(result[0].petId).toBe(petId);
    });

    it('should handle multiple weights with different values and dates', async () => {
      // Arrange
      const petId = '018c8f8e-7b4a-7890-abcd-ef1234567890';
      const mockPet = Pet.create('Fluffy');
      
      const weights = [
        Weight.create(petId, 5.0, new Date('2024-01-01')),
        Weight.create(petId, 10.5, new Date('2024-02-01')),
        Weight.create(petId, 15.75, new Date('2024-03-01')),
        Weight.create(petId, 20.0, new Date('2024-04-01')),
      ];
      
      mockPetRepository.findById.mockResolvedValue(mockPet);
      mockWeightRepository.findByPetId.mockResolvedValue(weights);

      // Act
      const result = await useCase.execute(petId);

      // Assert
      expect(result).toHaveLength(4);
      expect(result.map((w: { weight: number }) => w.weight)).toEqual([5.0, 10.5, 15.75, 20.0]);
      expect(mockWeightRepository.findByPetId).toHaveBeenCalledTimes(1);
    });
  });
});
