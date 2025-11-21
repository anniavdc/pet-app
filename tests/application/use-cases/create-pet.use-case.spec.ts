import { CreatePetUseCase } from '@application/use-cases/create-pet.use-case';
import { CreatePetDTO } from '@application/dtos/create-pet.dto';
import { IPetRepository } from '@domain/repositories/pet.repository.interface';
import { Pet } from '@domain/entities/pet.entity';

describe('CreatePetUseCase', () => {
  let useCase: CreatePetUseCase;
  let mockPetRepository: jest.Mocked<IPetRepository>;

  beforeEach(() => {
    mockPetRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    useCase = new CreatePetUseCase(mockPetRepository);
  });

  describe('execute', () => {
    it('should create pet successfully', async () => {
      // Arrange
      const input: CreatePetDTO = {
        name: 'Max',
      };

      mockPetRepository.save.mockImplementation(async (pet) => pet);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.name).toBe('Max');
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(mockPetRepository.save).toHaveBeenCalledTimes(1);
      expect(mockPetRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Max',
        })
      );
    });

    it('should throw error when pet name is empty', async () => {
      // Arrange
      const input: CreatePetDTO = {
        name: '',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Pet name is required');
      expect(mockPetRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when pet name exceeds 255 characters', async () => {
      // Arrange
      const input: CreatePetDTO = {
        name: 'a'.repeat(256),
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'Pet name cannot exceed 255 characters'
      );
      expect(mockPetRepository.save).not.toHaveBeenCalled();
    });

    it('should call repository save with correct pet entity', async () => {
      // Arrange
      const input: CreatePetDTO = {
        name: 'Buddy',
      };

      const savedPet = new Pet('test-id', 'Buddy');
      mockPetRepository.save.mockResolvedValue(savedPet);

      // Act
      await useCase.execute(input);

      // Assert
      expect(mockPetRepository.save).toHaveBeenCalledWith(
        expect.any(Pet)
      );
    });
  });
});
