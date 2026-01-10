import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { TemplateResponseDto } from '../Response/template.response.dto';

@Schema({ _id: false })
export class Exercise {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  reps: number;

  @Prop({ required: false })
  weight: number;

  @Prop({ required: false })
  factor?: number;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

@Schema({
  collection: 'trainingtemplates',
  timestamps: { createdAt: '_createdAt', updatedAt: '_updatedAt' },
})
export class TrainingTemplate extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, default: false })
  status: boolean;

  @Prop()
  _updatedAt: Date;

  @Prop()
  _createdAt: Date;

  @Prop({ type: [ExerciseSchema], default: [] })
  plan: Exercise[];

  static mapToDto(entity: TrainingTemplate): TemplateResponseDto {
    return new TemplateResponseDto({
      id: entity._id.toString(),
      title: entity.title,
      description: entity.description,
      status: entity.status,
      created_date: entity._createdAt,
      updated_date: entity._updatedAt,
      plan: entity.plan,
    });
  }
}

export const TrainingTemplateSchema =
  SchemaFactory.createForClass(TrainingTemplate);
