import request from 'supertest';
import express, { Application } from 'express';
import { AppDataSource } from '@infrastructure/database/data-source';
import weightController from '@presentation/controllers/weight.controller';
import { errorHandler } from '@presentation/middlewares/error.middleware';
import { PetEntity } from '@infrastructure/database/entities/pet.entity';
import { WeightEntity } from '@infrastructure/database/entities/weight.entity';

describe('Weight Controller - POST /api/pets/:petId/weights', () => {
  let app: Application;

  beforeAll(async () => {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api', weightController);
    app.use(errorHandler);
  });

  beforeEach(async () => {
    // Clean up database before each test - delete child records first
    const weightRepo = AppDataSource.getRepository(WeightEntity);
    const petRepo = AppDataSource.getRepository(PetEntity);
    
    await weightRepo.query('DELETE FROM weight');
    await petRepo.query('DELETE FROM pet');
  });

  describe('POST /api/pets/:petId/weights', () => {
    it('should return 201 and create weight when data is valid', async () => {
      // Arrange - Create a pet first
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      const weightData = {
        weight: 25.5,
        date: '2023-11-20',
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${pet.id}/weights`)
        .send(weightData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.petId).toBe(pet.id);
      expect(response.body.weight).toBe(25.5);
      expect(response.body.date).toBe('2023-11-20');
    });

    it('should return 404 when pet does not exist', async () => {
      // Arrange
      const nonExistentPetId = '123e4567-e89b-12d3-a456-426614174999';
      const weightData = {
        weight: 25.5,
        date: '2023-11-20',
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${nonExistentPetId}/weights`)
        .send(weightData)
        .expect(404);

      // Assert
      expect(response.body.error).toContain('Pet');
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 when petId is invalid UUID', async () => {
      // Arrange
      const invalidPetId = 'invalid-uuid';
      const weightData = {
        weight: 25.5,
        date: '2023-11-20',
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${invalidPetId}/weights`)
        .send(weightData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Pet ID must be a valid UUID');
    });

    it('should return 400 when weight is missing', async () => {
      // Arrange
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      const invalidData = {
        date: '2025-11-20',
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${pet.id}/weights`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Weight must be a number');
    });

    it('should return 400 when weight is zero', async () => {
      // Arrange
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      const invalidWeightData = {
        weight: -5,
        date: '2023-11-20',
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${pet.id}/weights`)
        .send(invalidWeightData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Weight must be greater than 0');
    });

    it('should return 400 when weight exceeds 1000', async () => {
      // Arrange
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      const invalidWeightData = {
        weight: 1001,
        date: '2023-11-20',
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${pet.id}/weights`)
        .send(invalidWeightData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Weight cannot exceed 1000 kg');
    });

    it('should return 400 when date is missing', async () => {
      // Arrange
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      const invalidData = {
        weight: 25.5,
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${pet.id}/weights`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Date must be a valid date string');
    });

    it('should return 400 when date format is invalid', async () => {
      // Arrange
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      const invalidData = {
        weight: 25.5,
        date: 'invalid-date',
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${pet.id}/weights`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 when date is in the future', async () => {
      // Arrange
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        weight: 25.5,
        date: futureDate.toISOString().split('T')[0],
      };

      // Act
      const response = await request(app)
        .post(`/api/pets/${pet.id}/weights`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Weight date cannot be in the future');
    });

    it('should return 400 when request body is empty', async () => {
      // Arrange
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      // Act
      const response = await request(app)
        .post(`/api/pets/${pet.id}/weights`)
        .send({})
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/pets/:petId/weights', () => {
    it('should return 200 and empty array when pet has no weights', async () => {
      // Arrange - Create a pet without weights
      const petRepository = AppDataSource.getRepository(PetEntity);
      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      // Act
      const response = await request(app)
        .get(`/api/pets/${pet.id}/weights`)
        .expect(200);

      // Assert
      expect(response.body).toEqual([]);
    });

    it('should return 200 and array of weights when pet has weights', async () => {
      // Arrange - Create a pet with multiple weights
      const petRepository = AppDataSource.getRepository(PetEntity);
      const weightRepository = AppDataSource.getRepository(WeightEntity);

      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      // Create multiple weights with different dates
      const weight1 = weightRepository.create({
        id: '223e4567-e89b-12d3-a456-426614174001',
        weight: 20.0,
        date: new Date('2024-01-15'),
        petId: pet.id,
      });
      const weight2 = weightRepository.create({
        id: '223e4567-e89b-12d3-a456-426614174002',
        weight: 22.5,
        date: new Date('2024-02-15'),
        petId: pet.id,
      });
      const weight3 = weightRepository.create({
        id: '223e4567-e89b-12d3-a456-426614174003',
        weight: 25.0,
        date: new Date('2024-03-15'),
        petId: pet.id,
      });
      await weightRepository.save([weight1, weight2, weight3]);

      // Act
      const response = await request(app)
        .get(`/api/pets/${pet.id}/weights`)
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(3);
      // Repository returns weights ordered by date DESC (most recent first)
      expect(response.body[0].weight).toBe(25.0);
      expect(response.body[0].date).toBe('2024-03-15');
      expect(response.body[1].weight).toBe(22.5);
      expect(response.body[1].date).toBe('2024-02-15');
      expect(response.body[2].weight).toBe(20.0);
      expect(response.body[2].date).toBe('2024-01-15');
      // Check all weights have proper structure
      response.body.forEach((weight: any) => {
        expect(weight).toHaveProperty('id');
        expect(weight).toHaveProperty('weight');
        expect(weight).toHaveProperty('date');
        expect(weight).toHaveProperty('petId');
        expect(weight.petId).toBe(pet.id);
      });
    });

    it('should return 404 when pet does not exist', async () => {
      // Arrange
      const nonExistentPetId = '123e4567-e89b-12d3-a456-426614174999';

      // Act
      const response = await request(app)
        .get(`/api/pets/${nonExistentPetId}/weights`)
        .expect(404);

      // Assert
      expect(response.body.error).toContain('Pet');
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 when petId is invalid UUID', async () => {
      // Arrange
      const invalidPetId = 'invalid-uuid';

      // Act
      const response = await request(app)
        .get(`/api/pets/${invalidPetId}/weights`)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Pet ID must be a valid UUID');
    });

    it('should return weights in descending date order (most recent first)', async () => {
      // Arrange
      const petRepository = AppDataSource.getRepository(PetEntity);
      const weightRepository = AppDataSource.getRepository(WeightEntity);

      const pet = petRepository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Max',
      });
      await petRepository.save(pet);

      // Create weights in random order
      const weights = [
        weightRepository.create({
          id: '223e4567-e89b-12d3-a456-426614174001',
          weight: 22.0,
          date: new Date('2024-02-10'),
          petId: pet.id,
        }),
        weightRepository.create({
          id: '223e4567-e89b-12d3-a456-426614174002',
          weight: 25.0,
          date: new Date('2024-04-10'),
          petId: pet.id,
        }),
        weightRepository.create({
          id: '223e4567-e89b-12d3-a456-426614174003',
          weight: 20.0,
          date: new Date('2024-01-10'),
          petId: pet.id,
        }),
        weightRepository.create({
          id: '223e4567-e89b-12d3-a456-426614174004',
          weight: 23.5,
          date: new Date('2024-03-10'),
          petId: pet.id,
        }),
      ];
      await weightRepository.save(weights);

      // Act
      const response = await request(app)
        .get(`/api/pets/${pet.id}/weights`)
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(4);
      // Verify descending order
      expect(response.body[0].date).toBe('2024-04-10');
      expect(response.body[1].date).toBe('2024-03-10');
      expect(response.body[2].date).toBe('2024-02-10');
      expect(response.body[3].date).toBe('2024-01-10');
    });
  });
});
