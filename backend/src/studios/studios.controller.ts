import { Controller, Get, Query } from '@nestjs/common';
import { StudiosService } from './studios.service';
import { CountriesResponseDto } from './dtos/Response/countries.response.dto';
import { CitiesResponseDto } from './dtos/Response/cities.response.dto';
import { StudiosResponseDto } from './dtos/Response/studios.response.dto';
import { EquipmentResponseDto } from './dtos/Response/equipment.response.dto';

@Controller('studios')
export class StudiosController {
  constructor(private readonly studioService: StudiosService) {}

  @Get()
  async getCountries(): Promise<CountriesResponseDto> {
    return await this.studioService.getCountries();
  }

  @Get('cities')
  async getCities(
    @Query('country') country: string,
  ): Promise<CitiesResponseDto> {
    return await this.studioService.getCities(country);
  }

  @Get('gyms')
  async getStudios(
    @Query('country') country: string,
    @Query('city') city: string,
  ): Promise<StudiosResponseDto> {
    return await this.studioService.getStudios(country, city);
  }

  @Get('equipment')
  async getEquipment(
    @Query('studio') studio: string,
  ): Promise<EquipmentResponseDto> {
    return await this.studioService.getEquipmentofStudio(studio);
  }
}
