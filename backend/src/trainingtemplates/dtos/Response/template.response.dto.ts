import { Type } from 'class-transformer';

export class ExerciseResponseDto {
  title: string;

  reps: number;

  weight: number;

  factor?: number;
}

export class TemplateResponseDto {
  id: string;

  title: string;

  description?: string;

  status: boolean;

  icon: string;

  created_date: Date;

  updated_date: Date;

  @Type(() => ExerciseResponseDto)
  plan: ExerciseResponseDto[];

  constructor(partial: Partial<TemplateResponseDto>) {
    Object.assign(this, partial);
  }
}
