import { Controller, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Public()
  @Post('sync')
  async syncFitnessData() {
    const apiKey = process.env.SCRAPER_API_KEY || '';
    const result = await this.scraperService.scrapeFitnessStudioPages(apiKey);

    return {
      success: true,
      message: 'Fitness data synced successfully',
      data: result,
    };
  }
}
