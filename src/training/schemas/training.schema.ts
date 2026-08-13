import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { TrainingTemplate } from 'src/trainingtemplates/schemas/trainingtemplates.schema';
import { User } from 'src/user/schemas/user.schema';
import { TrainingResponseDto } from '../dtos/Response/training.response.dto';
import { TrainingOverviewResponseDto } from '../dtos/Response/training.overview.response.dto';

@Schema({ _id: true })
export class Exercise {
  _id?: Types.ObjectId;

  exerciseId?: Types.ObjectId;

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

  @Prop({ required: true, default: true })
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

  static mapToDto(training: Training): TrainingResponseDto {
    return new TrainingResponseDto({
      _id: training._id.toString(),
      templateId: training.templateId?.toString?.(),
      title: training.title,
      description: training.description,
      activeDate: training.activeDate,
      active: training.active,
      icon: training.icon,
      _updatedAt: training._updatedAt,
      _createdAt: training._createdAt,
      plan: training.plan.map((ex) => ({
        exerciseId: ex._id?.toString?.(),
        title: ex.title,
        reps: ex.reps,
        repsDone: ex.repsDone,
        weight: ex.weight,
        weightDone: ex.weightDone,
        factor: ex.factor,
      })),
    });
  }

  static mapToOverviewDto(entity: Training): TrainingOverviewResponseDto {
    return new TrainingOverviewResponseDto({
      id: entity._id.toString(),
      title: entity.title,
      description: entity.description,
      status: entity.active,
      activeDate: entity.activeDate,
      icon: entity.icon,
      created_date: entity._createdAt,
      updated_date: entity._updatedAt,
    });
  }
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
