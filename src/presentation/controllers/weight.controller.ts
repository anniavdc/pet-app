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

/**
 * @swagger
 * /api/pets/{petId}/weights:
 *   post:
 *     summary: Add a weight measurement for a pet
 *     tags: [Weights]
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The pet ID
 *         example: 018c8f8e-7b4a-7890-abcd-ef1234567890
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWeight'
 *     responses:
 *       201:
 *         description: Weight measurement added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Weight'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Pet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalError'
 */
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
