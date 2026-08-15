import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FitnessStudio } from './schemas/scrapedData.schema';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ScraperService {
  constructor(
    @InjectModel(FitnessStudio.name)
    private fitnessStudioModel: Model<FitnessStudio>,
    private readonly httpService: HttpService,
  ) {}

  async scrapeFitnessStudioPages(apiKey: string) {
    try {

      const response = await firstValueFrom(
        this.httpService.post(
          `http://python-scraper:5000/scrape`,
          {},
          {
            headers: {
              apiKey: apiKey,
            },
          },
        ),
      );

      const countries: Partial<FitnessStudio>[] = [];

      for (const [countryName, cities] of Object.entries(
        response.data.data || {},
      )) {
        const cityDocs = Object.entries(
          cities as Record<string, any[]>,
        ).map(([cityName, cityStudios]) => ({
          name: cityName,
          studios: cityStudios.map((studio) => ({
            name: studio.name,
            href: studio.href,
            muskelgruppen: Object.entries(studio.equipment || {}).map(
              ([name, devices]) => ({
                name,
                equipment: (devices as string[]).map((d) => ({ name: d })),
              }),
            ),
          })),
        }));

        countries.push({ country: countryName, cities: cityDocs });
      }

      await this.fitnessStudioModel.deleteMany({});
      await this.fitnessStudioModel.insertMany(countries);

      return { success: true, count: countries.length };
    } catch (error) {
      console.error('Scrape failed:', error);
      throw error;
    }
  }
}
