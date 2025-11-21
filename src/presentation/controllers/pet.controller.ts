import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/data-source';
import { PetEntity } from '@infrastructure/database/entities/pet.entity';
import { TypeORMPetRepository } from '@infrastructure/database/repositories/typeorm-pet.repository';
import { CreatePetUseCase } from '@application/use-cases/create-pet.use-case';
import { CreatePetDTO } from '@application/dtos/create-pet.dto';
import { validateBody } from '@presentation/middlewares/validation.middleware';
import { ROUTES } from '@presentation/routes';

const router = Router();

router.post(
  ROUTES.PETS.BASE,
  validateBody(CreatePetDTO),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const petRepository = new TypeORMPetRepository(
        AppDataSource.getRepository(PetEntity)
      );
      
      const useCase = new CreatePetUseCase(petRepository);
      const result = await useCase.execute(req.body as CreatePetDTO);
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
