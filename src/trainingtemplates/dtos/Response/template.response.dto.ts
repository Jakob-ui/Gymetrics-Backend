import { Expose, Type } from 'class-transformer';

export class ExerciseResponseDto {
  @Expose()
  title: string;

  @Expose()
  reps: number;

  @Expose()
  weight: number;

  @Expose()
  factor?: number;
}

export class TemplateResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  status: boolean;

  @Expose()
  icon: string;

  @Expose()
  created_date: Date;

  @Expose()
  updated_date: Date;

  @Expose()
  @Type(() => ExerciseResponseDto)
  plan: ExerciseResponseDto[];

  constructor(partial: Partial<TemplateResponseDto>) {
    Object.assign(this, partial);
  }
}
