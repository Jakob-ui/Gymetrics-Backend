import { IsNumber, IsString } from 'class-validator';

export class ExerciseRequestDto {
  @IsString()
  _id: string;

  @IsNumber()
  repsDone: number;

  @IsNumber()
  weightDone: number;
}
