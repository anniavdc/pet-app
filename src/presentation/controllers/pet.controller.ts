import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/data-source';
import { PetEntity } from '@infrastructure/database/entities/pet.entity';
import { TypeORMPetRepository } from '@infrastructure/database/repositories/typeorm-pet.repository';
import { CreatePetUseCase } from '@application/use-cases/create-pet.use-case';
import { CreatePetDTO } from '@application/dtos/create-pet.dto';
import { validateBody } from '@presentation/middlewares/validation.middleware';
import { ROUTES } from '@presentation/routes';

const router = Router();

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Create a new pet
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePet'
 *     responses:
 *       201:
 *         description: Pet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalError'
 */
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
