import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FitnessStudio,
  FitnessStudioSchema,
} from './schemas/scrapedData.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FitnessStudio.name, schema: FitnessStudioSchema },
    ]),
    HttpModule,
  ],
  providers: [ScraperService],
  controllers: [ScraperController],
})
export class ScraperModule {}
