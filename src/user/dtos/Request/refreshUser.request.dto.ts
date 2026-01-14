import { IsString } from 'class-validator';

export class RefreshUserRequestDto {
  @IsString()
  refreshToken: string;
}
