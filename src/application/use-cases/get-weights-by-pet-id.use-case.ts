import { IWeightRepository } from '@domain/repositories/weight.repository.interface';
import { IPetRepository } from '@domain/repositories/pet.repository.interface';
import { NotFoundError } from '@domain/errors';
import { WeightOutputDTO } from '@application/dtos/weight-output.dto';

export class GetWeightsByPetIdUseCase {
  constructor(
    private readonly weightRepository: IWeightRepository,
    private readonly petRepository: IPetRepository
  ) {}

  async execute(petId: string): Promise<WeightOutputDTO[]> {
    // 1. Validate pet exists
    const pet = await this.petRepository.findById(petId);
    if (!pet) {
      throw new NotFoundError('Pet', petId);
    }

    // 2. Get all weights for the pet
    const weights = await this.weightRepository.findByPetId(petId);

    // 3. Map to DTOs
    return weights.map(
      (weight) =>
        new WeightOutputDTO(
          weight.id,
          weight.petId,
          weight.weight,
          weight.date.toISOString().split('T')[0]
        )
    );
  }
}
