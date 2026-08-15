import { IsString, IsArray, ValidateNested, IsObject } from 'class-validator';

export class EquipmentResponseDto {
  @IsString()
  name?: string;
}

export class MuskelGruppeResponseDto {
  @IsString()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  equipment?: EquipmentResponseDto[];
}

export class StudioResponseDto {
  @IsString()
  name?: string;

  @IsString()
  href?: string;

  @IsObject()
  equipment?: Record<string, EquipmentResponseDto[]>;
}

export class CityArrayResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  studios?: StudioResponseDto[];
}

export class ScrapeDataResponseDto {
  @IsObject()
  data?: Record<string, Record<string, StudioResponseDto[]>>;
}
