import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import * as appController from 'src/app.controller';
import { TrainingService } from './training.service';
import { TrainingRequestDto } from './Request/training.request.dto';
import { ExerciseRequestDto } from './Request/trainingUpdate.request.dto';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('create')
  async createTraining(
    @Request() req: appController.AuthenticatedRequest,
    @Body() createDto: TrainingRequestDto,
  ) {
    const userId = req.user.userId;
    await this.trainingService.createTraining(userId, createDto);
  }

  @Post(':id')
  async updateExercise(
    @Request() req: appController.AuthenticatedRequest,
    @Param('id') trainingId: string,
    @Body() updatedExercise: ExerciseRequestDto,
  ) {
    const userId = req.user.userId;
    await this.trainingService.updateExercise(
      userId,
      trainingId,
      updatedExercise,
    );
  }

  @Get(':id')
  async getTraining(
    @Request() req: appController.AuthenticatedRequest,
    @Param('id') trainingId: string,
  ) {
    const userId = req.user.userId;
    return await this.trainingService.getTraining(userId, trainingId);
  }
}
