import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { SetDoneRequestDto } from './trainingSave.request.dto';

export class ExerciseRequestDto {
  @IsString()
  _id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDoneRequestDto)
  setsDone: SetDoneRequestDto[];
}
