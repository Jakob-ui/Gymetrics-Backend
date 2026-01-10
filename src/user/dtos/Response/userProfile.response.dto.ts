import { IsOptional, IsString } from 'class-validator';

export class UserProfileResponseDto {
  @IsString()
  name: string;
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  height: string;

  @IsOptional()
  @IsString()
  weigth: string;

  @IsOptional()
  @IsString()
  msucle?: string;

  _createdAt: Date;
  _updatedAt: Date;

  constructor(partial?: Partial<UserProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
