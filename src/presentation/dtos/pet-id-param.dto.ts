import { IsUUID } from 'class-validator';

export class PetIdParamDTO {
  @IsUUID('all', { message: 'Pet ID must be a valid UUID' })
  petId!: string;
}
