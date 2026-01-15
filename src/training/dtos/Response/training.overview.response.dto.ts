import { Expose } from 'class-transformer';

export class TrainingOverviewResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: boolean;

  @Expose()
  icon: string;

  @Expose()
  activeDate: Date;

  @Expose()
  created_date: Date;

  @Expose()
  updated_date: Date;

  constructor(partial: Partial<TrainingOverviewResponseDto>) {
    Object.assign(this, partial);
  }
}
