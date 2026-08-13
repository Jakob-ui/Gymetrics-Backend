import { Module } from '@nestjs/common';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { Training, TrainingSchema } from './schemas/training.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TrainingTemplate,
  TrainingTemplateSchema,
} from 'src/trainingtemplates/schemas/trainingtemplates.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
      { name: TrainingTemplate.name, schema: TrainingTemplateSchema },
    ]),
  ],
  providers: [TrainingService],
  controllers: [TrainingController],
})
export class TrainingModule {}
