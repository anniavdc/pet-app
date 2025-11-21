import { Weight } from '@domain/entities/weight.entity';

describe('Weight Entity', () => {
  const validPetId = '123e4567-e89b-12d3-a456-426614174000';
  const validDate = new Date('2023-11-20');

  describe('constructor', () => {
    it('should create a weight with valid data', () => {
      const weight = new Weight(
        '123e4567-e89b-12d3-a456-426614174001',
        validPetId,
        25.5,
        validDate
      );

      expect(weight.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(weight.petId).toBe(validPetId);
      expect(weight.weight).toBe(25.5);
      expect(weight.date).toBe(validDate);
    });

    it('should throw error when weight is zero', () => {
      expect(() => {
        new Weight('123e4567-e89b-12d3-a456-426614174001', validPetId, 0, validDate);
      }).toThrow('Weight must be greater than 0');
    });

    it('should throw error when weight is negative', () => {
      expect(() => {
        new Weight('123e4567-e89b-12d3-a456-426614174001', validPetId, -5, validDate);
      }).toThrow('Weight must be greater than 0');
    });

    it('should throw error when weight exceeds 1000', () => {
      expect(() => {
        new Weight('123e4567-e89b-12d3-a456-426614174001', validPetId, 1001, validDate);
      }).toThrow('Weight cannot exceed 1000 kg');
    });

    it('should throw error when date is in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      expect(() => {
        new Weight('123e4567-e89b-12d3-a456-426614174001', validPetId, 25.5, futureDate);
      }).toThrow('Weight date cannot be in the future');
    });

    it('should accept current date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weight = new Weight(
        '123e4567-e89b-12d3-a456-426614174001',
        validPetId,
        25.5,
        today
      );

      expect(weight.date).toEqual(today);
    });
  });

  describe('create', () => {
    it('should create a weight with auto-generated UUID', () => {
      const weight = Weight.create(validPetId, 25.5, validDate);

      expect(weight.id).toBeDefined();
      expect(weight.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(weight.petId).toBe(validPetId);
      expect(weight.weight).toBe(25.5);
    });
  });

  describe('weight setter', () => {
    it('should update weight with valid value', () => {
      const weight = new Weight(
        '123e4567-e89b-12d3-a456-426614174001',
        validPetId,
        25.5,
        validDate
      );

      weight.weight = 30.0;

      expect(weight.weight).toBe(30.0);
    });

    it('should throw error when setting invalid weight', () => {
      const weight = new Weight(
        '123e4567-e89b-12d3-a456-426614174001',
        validPetId,
        25.5,
        validDate
      );

      expect(() => {
        weight.weight = 0;
      }).toThrow('Weight must be greater than 0');
    });
  });

  describe('date setter', () => {
    it('should update date with valid value', () => {
      const weight = new Weight(
        '123e4567-e89b-12d3-a456-426614174001',
        validPetId,
        25.5,
        validDate
      );

      const newDate = new Date('2025-11-19');
      weight.date = newDate;

      expect(weight.date).toBe(newDate);
    });

    it('should throw error when setting future date', () => {
      const weight = new Weight(
        '123e4567-e89b-12d3-a456-426614174001',
        validPetId,
        25.5,
        validDate
      );

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      expect(() => {
        weight.date = futureDate;
      }).toThrow('Weight date cannot be in the future');
    });
  });
});
