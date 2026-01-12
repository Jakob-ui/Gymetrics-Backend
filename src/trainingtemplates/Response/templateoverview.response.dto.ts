import { Expose } from 'class-transformer';

export class TemplateOverviewResponseDto {
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
  created_date: Date;

  @Expose()
  updated_date: Date;

  constructor(partial: Partial<TemplateOverviewResponseDto>) {
    Object.assign(this, partial);
  }
}
