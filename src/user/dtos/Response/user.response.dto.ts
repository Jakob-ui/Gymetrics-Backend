import { Types } from 'mongoose';

export class UserResponseDto {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  email: string;
  _createdAt: Date;
  _updatedAt: Date;
}
