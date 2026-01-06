import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ index: true }) userId: string;
  @Prop() name: string;
  @Prop({ unique: true }) email: string;
  @Prop() password: string;
  @Prop() _createdAt: Date;
  @Prop() _updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
