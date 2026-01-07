import { IsString, IsNotEmpty } from 'class-validator';

export class UserRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
