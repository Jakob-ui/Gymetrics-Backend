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
  weight: string;

  @IsOptional()
  @IsString()
  muscle: string;

  _createdAt: Date;
  _updatedAt: Date;

  constructor(partial?: Partial<UserProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
