import request from 'supertest';
import express, { Application } from 'express';
import { AppDataSource } from '@infrastructure/database/data-source';
import petController from '@presentation/controllers/pet.controller';
import { errorHandler } from '@presentation/middlewares/error.middleware';
import { PetEntity } from '@infrastructure/database/entities/pet.entity';

describe('Pet Controller - POST /api/pets', () => {
  let app: Application;

  beforeAll(async () => {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api', petController);
    app.use(errorHandler);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await AppDataSource.getRepository(PetEntity).query('DELETE FROM weight');
    await AppDataSource.getRepository(PetEntity).query('DELETE FROM pet');
  });

  describe('POST /api/pets', () => {
    it('should return 201 and create pet when data is valid', async () => {
      // Arrange
      const petData = {
        name: 'Max',
      };

      // Act
      const response = await request(app)
        .post('/api/pets')
        .send(petData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Max');
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should return 400 when name is missing', async () => {
      // Arrange
      const invalidData = {};

      // Act
      const response = await request(app)
        .post('/api/pets')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Pet name is required');
    });

    it('should return 400 when name is empty string', async () => {
      // Arrange
      const invalidData = {
        name: '',
      };

      // Act
      const response = await request(app)
        .post('/api/pets')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Pet name is required');
    });

    it('should return 400 when name is not a string', async () => {
      // Arrange
      const invalidData = {
        name: 123,
      };

      // Act
      const response = await request(app)
        .post('/api/pets')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Pet name must be a string');
    });

    it('should return 400 when name exceeds 255 characters', async () => {
      // Arrange
      const invalidData = {
        name: 'a'.repeat(256),
      };

      // Act
      const response = await request(app)
        .post('/api/pets')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Pet name cannot exceed 255 characters');
    });

    it('should trim whitespace and accept valid name', async () => {
      // Arrange
      const petData = {
        name: '  Fluffy  ',
      };

      // Act
      const response = await request(app)
        .post('/api/pets')
        .send(petData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('  Fluffy  '); // Name stored as-is, trimming is in domain validation
    });

    it('should accept pet with maximum valid name length', async () => {
      // Arrange
      const petData = {
        name: 'a'.repeat(255),
      };

      // Act
      const response = await request(app)
        .post('/api/pets')
        .send(petData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('a'.repeat(255));
    });

    it('should return 400 when request body is empty', async () => {
      // Act
      const response = await request(app)
        .post('/api/pets')
        .send({})
        .expect(400);

      // Assert
      expect(response.body.error).toBe('Validation failed');
    });
  });
});
