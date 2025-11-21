import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/data-source';
import { PetEntity } from '@infrastructure/database/entities/pet.entity';
import { WeightEntity } from '@infrastructure/database/entities/weight.entity';
import { TypeORMPetRepository } from '@infrastructure/database/repositories/typeorm-pet.repository';
import { TypeORMWeightRepository } from '@infrastructure/database/repositories/typeorm-weight.repository';
import { CreateWeightUseCase } from '@application/use-cases/create-weight.use-case';
import { CreateWeightDTO } from '@application/dtos/create-weight.dto';
import { validateBody, validateParams } from '@presentation/middlewares/validation.middleware';
import { ROUTES } from '@presentation/routes';
import { PetIdParamDTO } from '@presentation/dtos/pet-id-param.dto';

const router = Router();

router.post(
  ROUTES.PETS.WEIGHTS,
  validateParams(PetIdParamDTO),
  validateBody(CreateWeightDTO),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { petId } = req.params;
      
      const petRepository = new TypeORMPetRepository(
        AppDataSource.getRepository(PetEntity)
      );
      const weightRepository = new TypeORMWeightRepository(
        AppDataSource.getRepository(WeightEntity)
      );
      
      const useCase = new CreateWeightUseCase(weightRepository, petRepository);
      const result = await useCase.execute(petId, req.body as CreateWeightDTO);
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
