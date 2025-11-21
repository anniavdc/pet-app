import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError } from '@domain/errors';

export function validateBody<T extends object>(dtoClass: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const dtoInstance = plainToClass(dtoClass, req.body);
    
    const errors = await validate(dtoInstance);
    
    if (errors.length > 0) {
      const errorMessages = errors.flatMap((error: ClassValidatorError) =>
        Object.values(error.constraints || {})
      );
      return next(new ValidationError(errorMessages));
    }
    
    req.body = dtoInstance;
    next();
  };
}

export function validateParams<T extends object>(dtoClass: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const dtoInstance = plainToClass(dtoClass, req.params);
    
    const errors = await validate(dtoInstance);
    
    if (errors.length > 0) {
      const errorMessages = errors.flatMap((error: ClassValidatorError) =>
        Object.values(error.constraints || {})
      );
      return next(new ValidationError(errorMessages));
    }
    
    req.params = dtoInstance as Record<string, unknown>;
    next();
  };
}
