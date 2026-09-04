import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum TemplateSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class TemplateQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 10;

  @IsBoolean()
  @IsOptional()
  asc = true;

  @IsEnum(TemplateSortBy)
  @IsOptional()
  sortBy: TemplateSortBy = TemplateSortBy.CREATED_AT;

  @IsString()
  @IsOptional()
  search?: string;
}
