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
});
