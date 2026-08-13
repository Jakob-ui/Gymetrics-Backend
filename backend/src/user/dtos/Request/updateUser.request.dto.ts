import { IsString } from 'class-validator';

export class UserRequestDto {
  @IsString()
  name: string;

  @IsString()
  gender: string;

  @IsString()
  height: string;

  @IsString()
  weight: string;

  @IsString()
  muscle: string;
}
