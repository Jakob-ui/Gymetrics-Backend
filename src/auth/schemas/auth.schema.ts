import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'users', timestamps: true })
export class Auth extends Document {
  @Prop({ index: true }) userId: string;
  @Prop({ required: true }) name: string;
  @Prop({ unique: true, required: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop() _createdAt: Date;
  @Prop() _updatedAt: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
