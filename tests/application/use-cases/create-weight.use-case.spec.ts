import { CreateWeightUseCase } from '@application/use-cases/create-weight.use-case';
import { CreateWeightDTO } from '@application/dtos/create-weight.dto';
import { IWeightRepository } from '@domain/repositories/weight.repository.interface';
import { IPetRepository } from '@domain/repositories/pet.repository.interface';
import { Pet } from '@domain/entities/pet.entity';
import { Weight } from '@domain/entities/weight.entity';
import { NotFoundError } from '@domain/errors';

describe('CreateWeightUseCase', () => {
  let useCase: CreateWeightUseCase;
  let mockWeightRepository: jest.Mocked<IWeightRepository>;
  let mockPetRepository: jest.Mocked<IPetRepository>;

  beforeEach(() => {
    mockWeightRepository = {
      findByPetId: jest.fn(),
      save: jest.fn(),
    };

    mockPetRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    useCase = new CreateWeightUseCase(mockWeightRepository, mockPetRepository);
  });

  describe('execute', () => {
    const validPetId = '123e4567-e89b-12d3-a456-426614174000';
    const validInput: CreateWeightDTO = {
      weight: 25.5,
      date: '2023-11-20',
    };

    it('should create weight successfully when pet exists', async () => {
      // Arrange
      const pet = new Pet(validPetId, 'Max');
      mockPetRepository.findById.mockResolvedValue(pet);

      const savedWeight = new Weight(
        '123e4567-e89b-12d3-a456-426614174001',
        validPetId,
        25.5,
        new Date('2023-11-20')
      );
      mockWeightRepository.save.mockResolvedValue(savedWeight);

      // Act
      const result = await useCase.execute(validPetId, validInput);

      // Assert
      expect(mockPetRepository.findById).toHaveBeenCalledWith(validPetId);
      expect(mockWeightRepository.save).toHaveBeenCalledTimes(1);
      expect(result.petId).toBe(validPetId);
      expect(result.weight).toBe(25.5);
      expect(result.date).toBe('2023-11-20');
    });

    it('should throw NotFoundError when pet does not exist', async () => {
      // Arrange
      mockPetRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validPetId, validInput)).rejects.toThrow(
        NotFoundError
      );
      await expect(useCase.execute(validPetId, validInput)).rejects.toThrow(
        `Pet with id ${validPetId} not found`
      );
      expect(mockWeightRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when weight is invalid', async () => {
      // Arrange
      const pet = new Pet(validPetId, 'Max');
      mockPetRepository.findById.mockResolvedValue(pet);

      const invalidInput: CreateWeightDTO = {
        weight: 0,
        date: '2023-11-20',
      };

      // Act & Assert
      await expect(useCase.execute(validPetId, invalidInput)).rejects.toThrow(
        'Weight must be greater than 0'
      );
      expect(mockWeightRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when date is in the future', async () => {
      // Arrange
      const pet = new Pet(validPetId, 'Max');
      mockPetRepository.findById.mockResolvedValue(pet);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidInput: CreateWeightDTO = {
        weight: 25.5,
        date: futureDate.toISOString().split('T')[0],
      };

      // Act & Assert
      await expect(useCase.execute(validPetId, invalidInput)).rejects.toThrow(
        'Weight date cannot be in the future'
      );
      expect(mockWeightRepository.save).not.toHaveBeenCalled();
    });

    it('should call repository save with correct weight entity', async () => {
      // Arrange
      const pet = new Pet(validPetId, 'Max');
      mockPetRepository.findById.mockResolvedValue(pet);

      const savedWeight = new Weight(
        '123e4567-e89b-12d3-a456-426614174001',
        validPetId,
        25.5,
        new Date('2023-11-20')
      );
      mockWeightRepository.save.mockResolvedValue(savedWeight);

      // Act
      await useCase.execute(validPetId, validInput);

      // Assert
      expect(mockWeightRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          petId: validPetId,
          weight: 25.5,
        })
      );
    });
  });
});
