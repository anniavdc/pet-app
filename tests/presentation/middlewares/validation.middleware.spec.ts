import { Request, Response, NextFunction } from 'express';
import { validateParams } from '@presentation/middlewares/validation.middleware';
import { PetIdParamDTO } from '@presentation/dtos/pet-id-param.dto';
import { ValidationError } from '@domain/errors';

describe('Validation Middleware', () => {
  describe('validateParams', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        params: {},
      };
      mockResponse = {};
      mockNext = jest.fn();
    });

    it('should call next with ValidationError for invalid UUID', async () => {
      // Arrange
      mockRequest.params = { petId: 'invalid-uuid' };
      const middleware = validateParams(PetIdParamDTO);

      // Act
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should call next without error for valid UUID', async () => {
      // Arrange
      mockRequest.params = { petId: '123e4567-e89b-12d3-a456-426614174000' };
      const middleware = validateParams(PetIdParamDTO);

      // Act
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});
