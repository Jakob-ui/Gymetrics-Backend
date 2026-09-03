import { Module } from '@nestjs/common';
import { StudiosController } from './studios.controller';
import { StudiosService } from './studios.service';
import {
  FitnessStudio,
  FitnessStudioSchema,
} from 'src/scraper/schemas/scrapedData.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [StudiosController],
  providers: [StudiosService],
  imports: [
    MongooseModule.forFeature([
      { name: FitnessStudio.name, schema: FitnessStudioSchema },
    ]),
  ],
})
export class StudiosModule {}
