import { Pet } from '@domain/entities/pet.entity';
import { IPetRepository } from '@domain/repositories/pet.repository.interface';
import { CreatePetDTO } from '@application/dtos/create-pet.dto';
import { PetOutputDTO } from '@application/dtos/pet-output.dto';

export class CreatePetUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async execute(input: CreatePetDTO): Promise<PetOutputDTO> {
    // Create domain entity (validation happens here)
    const pet = Pet.create(input.name);

    // Persist and return
    const savedPet = await this.petRepository.save(pet);

    return new PetOutputDTO(savedPet.id, savedPet.name);
  }
}
