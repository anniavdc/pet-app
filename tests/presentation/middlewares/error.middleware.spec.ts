import { DomainError, NotFoundError, ValidationError } from '@domain/errors';
import { errorHandler } from '@presentation/middlewares/error.middleware';
import { NextFunction, Request, Response } from 'express';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {};
    mockResponse = {
      status: statusMock,
    };
    mockNext = jest.fn();
  });

  it('should handle ValidationError with 400 status', () => {
    const error = new ValidationError(['Field is required']);

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: ['Field is required'],
    });
  });

  it('should handle NotFoundError with 404 status', () => {
    const error = new NotFoundError('Pet', '123');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Pet with id 123 not found',
    });
  });

  it('should handle NotFoundError without id with 404 status', () => {
    const error = new NotFoundError('Pet');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Pet not found',
    });
  });

  it('should handle DomainError with 400 status', () => {
    const error = new DomainError('Invalid weight value');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid weight value',
    });
  });

  it('should handle unexpected errors with 500 status', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Unexpected database error');

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', error);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Internal server error',
    });

    consoleErrorSpy.mockRestore();
  });
});
