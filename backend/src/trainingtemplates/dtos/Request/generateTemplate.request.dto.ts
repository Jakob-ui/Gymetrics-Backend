import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateTemplateRequestDto {
  @IsString()
  @IsNotEmpty()
  studio: string;

  @IsString()
  @IsOptional()
  message: string;
}
