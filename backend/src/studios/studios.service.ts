import { Injectable, NotFoundException } from '@nestjs/common';
import { CountriesResponseDto } from './dtos/Response/countries.response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FitnessStudio } from 'src/scraper/schemas/scrapedData.schema';
import { Model } from 'mongoose';
import { CitiesResponseDto } from './dtos/Response/cities.response.dto';
import { StudiosResponseDto } from './dtos/Response/studios.response.dto';
import { EquipmentResponseDto } from './dtos/Response/equipment.response.dto';

@Injectable()
export class StudiosService {
  constructor(
    @InjectModel(FitnessStudio.name)
    private FitnessStudioModel: Model<FitnessStudio>,
  ) {}

  async getCountries(): Promise<CountriesResponseDto> {
    const countries = await this.FitnessStudioModel.distinct('country');
    const result: CountriesResponseDto = { countries };
    return result;
  }

  async getCities(country: string): Promise<CitiesResponseDto> {
    const doc = await this.FitnessStudioModel.findOne(
      { country },
      { 'cities.name': 1, _id: 0 },
    ).lean<{ cities: { name: string }[] } | null>();
    const cities = doc?.cities.map((c) => c.name) ?? [];
    return { cities };
  }

  async getStudios(country: string, city: string): Promise<StudiosResponseDto> {
    const doc = await this.FitnessStudioModel.findOne(
      { country },
      { 'cities.name': 1, 'cities.studios.name': 1, _id: 0 },
    ).lean<{
      cities: { name: string; studios: { name: string }[] }[];
    } | null>();

    const found = doc?.cities.find(
      (c) => c.name.toLowerCase() === city.toLowerCase(),
    );

    const studios = found?.studios.map((s) => s.name) ?? [];
    return { studios };
  }

  async getEquipmentofStudio(studio: string): Promise<EquipmentResponseDto> {
    const doc = await this.FitnessStudioModel.findOne(
      { 'cities.studios.name': studio },
      { 'cities.studios.name': 1, 'cities.studios.muskelgruppen': 1, _id: 0 },
    ).lean();

    const found = doc?.cities
      .flatMap((c) => c.studios)
      .find((s) => s.name.toLowerCase() === studio.toLowerCase());

    if (!found) {
      throw new NotFoundException(`Studio "${studio}" nicht gefunden`);
    }

    return {
      name: found.name,
      muscleGroups: found.muskelgruppen.map((mg) => ({
        name: mg.name,
        equipment: mg.equipment.map((e) => e.name),
      })),
    };
  }
}
