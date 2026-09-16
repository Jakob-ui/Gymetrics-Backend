import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ExerciseDoneRequestDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  repsDone?: number;

  @IsOptional()
  @IsNumber()
  weightDone?: number;

  constructor(init?: Partial<ExerciseDoneRequestDto>) {
    Object.assign(this, init);
  }
}

export class TrainingDoneRequestDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDoneRequestDto)
  plan?: ExerciseDoneRequestDto[];

  constructor(init?: Partial<TrainingDoneRequestDto>) {
    Object.assign(this, init);
  }
}
