import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePetDTO {
  @IsString({ message: 'Pet name must be a string' })
  @MinLength(1, { message: 'Pet name is required' })
  @MaxLength(255, { message: 'Pet name cannot exceed 255 characters' })
  name!: string;
}
