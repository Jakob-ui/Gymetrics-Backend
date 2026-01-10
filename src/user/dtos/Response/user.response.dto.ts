import { Types } from 'mongoose';

export class UserResponseDto {
  id: Types.ObjectId;
  name: string;
  email: string;

  constructor(partial?: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
