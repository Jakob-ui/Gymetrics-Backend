import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuthResponseDto } from '../Response/auth.response.dto';

@Schema({
  collection: 'users',
  timestamps: { createdAt: '_createdAt', updatedAt: '_updatedAt' },
})
export class Auth extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ unique: true, required: true }) email: string;
  @Prop({ required: true }) password: string;

  static mapToDto(
    userId: string,
    name: string,
    access_token: string,
  ): AuthResponseDto {
    return new AuthResponseDto({
      userId: userId,
      name: name,
      token: access_token,
    });
  }
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
