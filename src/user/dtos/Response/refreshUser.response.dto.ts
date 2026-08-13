import { IsString } from 'class-validator';

export class RefreshUserResponseDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  refreshToken: string;
}
