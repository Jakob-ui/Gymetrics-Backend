import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserProfileResponseDto } from '../dtos/Response/userProfile.response.dto';
import { UserResponseDto } from '../dtos/Response/user.response.dto';

@Schema({ timestamps: { createdAt: '_createdAt', updatedAt: '_updatedAt' } })
export class User extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ unique: true, required: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop() gender: string;
  @Prop() height: string;
  @Prop() weight: string;
  @Prop() muscle: string;
  @Prop() _createdAt: Date;
  @Prop() _updatedAt: Date;

  static mapToProfileResponseDto(user: User): UserProfileResponseDto {
    return new UserProfileResponseDto({
      name: user.name,
      email: user.email,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      muscle: user.muscle,
      _createdAt: user._createdAt,
      _updatedAt: user._updatedAt,
    });
  }

  static mapToUserResponseDto(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
