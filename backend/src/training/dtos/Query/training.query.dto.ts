import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum TrainingSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ACTIVE_DATE = 'activeDate',
}

export class TrainingQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 10;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  asc = true;

  @IsEnum(TrainingSortBy)
  @IsOptional()
  sortBy: TrainingSortBy = TrainingSortBy.CREATED_AT;

  @IsString()
  @IsOptional()
  search?: string;

  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
