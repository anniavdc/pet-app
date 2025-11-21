import { IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateWeightDTO {
  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(0.01, { message: 'Weight must be greater than 0' })
  @Max(1000, { message: 'Weight cannot exceed 1000 kg' })
  weight!: number;

  @IsDateString({}, { message: 'Date must be a valid date string' })
  date!: string;
}
