import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'users',
  timestamps: { createdAt: '_createdAt', updatedAt: '_updatedAt' },
})
export class Auth extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ unique: true, required: true }) email: string;
  @Prop({ required: true }) password: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
