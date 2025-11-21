import { Pet } from '@domain/entities/pet.entity';

describe('Pet Entity', () => {
  describe('constructor', () => {
    it('should create a pet with valid data', () => {
      const pet = new Pet('123e4567-e89b-12d3-a456-426614174000', 'Max');

      expect(pet.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(pet.name).toBe('Max');
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        new Pet('123e4567-e89b-12d3-a456-426614174000', '');
      }).toThrow('Pet name is required');
    });

    it('should throw error when name is only whitespace', () => {
      expect(() => {
        new Pet('123e4567-e89b-12d3-a456-426614174000', '   ');
      }).toThrow('Pet name is required');
    });

    it('should throw error when name exceeds 255 characters', () => {
      const longName = 'a'.repeat(256);
      expect(() => {
        new Pet('123e4567-e89b-12d3-a456-426614174000', longName);
      }).toThrow('Pet name cannot exceed 255 characters');
    });
  });

  describe('create', () => {
    it('should create a pet with auto-generated UUID', () => {
      const pet = Pet.create('Buddy');

      expect(pet.id).toBeDefined();
      expect(pet.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(pet.name).toBe('Buddy');
    });
  });

  describe('name setter', () => {
    it('should update name with valid value', () => {
      const pet = new Pet('123e4567-e89b-12d3-a456-426614174000', 'Max');

      pet.name = 'Buddy';

      expect(pet.name).toBe('Buddy');
    });

    it('should throw error when setting invalid name', () => {
      const pet = new Pet('123e4567-e89b-12d3-a456-426614174000', 'Max');

      expect(() => {
        pet.name = '';
      }).toThrow('Pet name is required');
    });
  });
});
