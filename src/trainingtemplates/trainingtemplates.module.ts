import { Module } from '@nestjs/common';
import { TrainingtemplatesService } from './trainingtemplates.service';
import { TrainingtemplatesController } from './trainingtemplates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TrainingTemplate,
  TrainingTemplateSchema,
} from './schemas/trainingtemplates.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingTemplate.name, schema: TrainingTemplateSchema },
    ]),
  ],
  providers: [TrainingtemplatesService],
  controllers: [TrainingtemplatesController],
})
export class TrainingtemplatesModule {}
