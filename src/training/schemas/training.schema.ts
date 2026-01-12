import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { TrainingTemplate } from 'src/trainingtemplates/schemas/trainingtemplates.schema';
import { User } from 'src/user/schemas/user.schema';

@Schema({ _id: false })
export class Exercise {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  reps: number;

  @Prop({ required: false })
  repsDone: number;

  @Prop({ required: false })
  weight: number;

  @Prop({ required: false })
  weightDone: number;

  @Prop({ required: false })
  factor?: number;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

@Schema({
  collection: 'trainings',
  timestamps: { createdAt: '_createdAt', updatedAt: '_updatedAt' },
})
export class Training extends Document {
  @Prop({ required: true })
  index: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({
    type: Types.ObjectId,
    ref: 'TrainingTemplate',
    required: true,
    index: true,
  })
  templateId: TrainingTemplate;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, default: false })
  active: boolean;

  @Prop({ required: true })
  activeDate: Date;

  @Prop({ required: false })
  icon?: string;

  @Prop()
  _updatedAt: Date;

  @Prop()
  _createdAt: Date;

  @Prop({ type: [ExerciseSchema], default: [] })
  plan: Exercise[];
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
