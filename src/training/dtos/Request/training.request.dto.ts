import { IsString } from 'class-validator';

export class TrainingRequestDto {
  @IsString()
  templateId: string;

  @IsString()
  activeDate: Date;
}
