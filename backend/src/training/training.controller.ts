import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import * as appController from 'src/app.controller';
import { TrainingService } from './training.service';
import { TrainingRequestDto } from './dtos/Request/training.request.dto';
import { ExerciseRequestDto } from './dtos/Request/trainingUpdate.request.dto';
import { TrainingResponseDto } from './dtos/Response/training.response.dto';
import { Training } from './schemas/training.schema';
import { TrainingOverviewResponseDto } from './dtos/Response/training.overview.response.dto';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new training for the user' })
  @ApiOkResponse({
    type: Training,
    description: 'Training created successfully',
  })
  async createTraining(
    @Request() req: appController.AuthenticatedRequest,
    @Body() createDto: TrainingRequestDto,
  ): Promise<Training> {
    const userId = req.user.userId;
    return await this.trainingService.createTraining(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainings for the user' })
  @ApiOkResponse({
    type: [TrainingOverviewResponseDto],
    description: 'List of trainings for the user',
  })
  async findAllForUser(
    @Request() req: appController.AuthenticatedRequest,
    @Query('active') active: boolean,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<TrainingOverviewResponseDto[]> {
    const userId = req.user.userId;
    return await this.trainingService.findAllForUser(
      userId,
      active,
      page,
      limit,
    );
  }

  @Get('nextTraining')
  @ApiOperation({ summary: 'Get the next active training for the user' })
  @ApiOkResponse({
    type: TrainingOverviewResponseDto,
    description: 'Next active training',
  })
  async findNearestactive(
    @Request() req: appController.AuthenticatedRequest,
    @Query('date') date?: string,
  ): Promise<TrainingOverviewResponseDto> {
    const userId = req.user.userId;
    const dateObj = date ? new Date(date) : new Date();
    return await this.trainingService.findNearestactive(userId, dateObj);
  }

  @Get('monthlyTrainings')
  @ApiOperation({ summary: 'Get trainings of a specific month for the user' })
  @ApiOkResponse({
    type: [TrainingOverviewResponseDto],
    description: 'Monthly trainings for the user',
  })
  async findTrainingsofMonth(
    @Request() req: appController.AuthenticatedRequest,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ): Promise<TrainingOverviewResponseDto[]> {
    if (!year || !month) {
      throw new NotFoundException(
        'Year and month query parameters are required',
      );
    }
    const userId = req.user.userId;
    return await this.trainingService.findTrainingsofMonth(userId, year, month);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Update an exercise in a training' })
  @ApiOkResponse({
    type: Training,
    description: 'Training updated successfully',
  })
  async updateExercise(
    @Request() req: appController.AuthenticatedRequest,
    @Param('id') trainingId: string,
    @Body() updatedExercise: ExerciseRequestDto,
  ): Promise<Training> {
    const userId = req.user.userId;
    return await this.trainingService.updateExercise(
      userId,
      trainingId,
      updatedExercise,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific training' })
  @ApiOkResponse({
    type: [TrainingResponseDto],
    description: 'Training details',
  })
  async getTraining(
    @Request() req: appController.AuthenticatedRequest,
    @Param('id') trainingId: string,
  ): Promise<TrainingResponseDto[]> {
    const userId = req.user.userId;
    return await this.trainingService.getTraining(userId, trainingId);
  }
}
