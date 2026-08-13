export class TrainingOverviewResponseDto {
  id: string;

  title: string;

  description: string;

  status: boolean;

  icon: string;

  activeDate: Date;

  created_date: Date;

  updated_date: Date;

  constructor(partial: Partial<TrainingOverviewResponseDto>) {
    Object.assign(this, partial);
  }
}
