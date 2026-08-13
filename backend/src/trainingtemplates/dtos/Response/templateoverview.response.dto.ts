export class TemplateOverviewResponseDto {
  id: string;

  title: string;

  description: string;

  status: boolean;

  icon: string;

  created_date: Date;

  updated_date: Date;

  constructor(partial: Partial<TemplateOverviewResponseDto>) {
    Object.assign(this, partial);
  }
}
