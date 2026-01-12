import { Body, Controller, Post, Request } from '@nestjs/common';
import * as appController from 'src/app.controller';
import { TrainingService } from './training.service';
import { TrainingRequestDto } from './Request/training.request.dto';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  async createTraining(
    @Request() req: appController.AuthenticatedRequest,
    @Body() createDto: TrainingRequestDto,
  ) {
    const userId = req.user.userId;
    await this.trainingService.createTraining(userId, createDto);
  }
}
