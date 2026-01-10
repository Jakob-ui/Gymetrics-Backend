import { IsString, IsNotEmpty } from 'class-validator';

export class UserRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  gender: string;

  @IsString()
  height: string;

  @IsString()
  weigth: string;

  @IsString()
  msucle: string;
}
