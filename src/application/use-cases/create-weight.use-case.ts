import { Weight } from '@domain/entities/weight.entity';
import { IPetRepository } from '@domain/repositories/pet.repository.interface';
import { IWeightRepository } from '@domain/repositories/weight.repository.interface';
import { NotFoundError } from '@domain/errors';
import { CreateWeightDTO } from '@application/dtos/create-weight.dto';
import { WeightOutputDTO } from '@application/dtos/weight-output.dto';

export class CreateWeightUseCase {
  constructor(
    private readonly weightRepository: IWeightRepository,
    private readonly petRepository: IPetRepository
  ) {}

  async execute(petId: string, input: CreateWeightDTO): Promise<WeightOutputDTO> {
    // 1. Validate pet exists
    const pet = await this.petRepository.findById(petId);
    if (!pet) {
      throw new NotFoundError('Pet', petId);
    }

    // 2. Create domain entity (validation happens here)
    const weight = Weight.create(
      petId,
      input.weight,
      new Date(input.date)
    );

    // 3. Persist and return
    const savedWeight = await this.weightRepository.save(weight);

    return new WeightOutputDTO(
      savedWeight.id,
      savedWeight.petId,
      savedWeight.weight,
      savedWeight.date.toISOString().split('T')[0]
    );
  }
}
