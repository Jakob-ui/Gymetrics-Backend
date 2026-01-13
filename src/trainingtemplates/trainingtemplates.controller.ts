import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { TemplateRequestDto } from './Request/template.request.dto';
import { TrainingtemplatesService } from './trainingtemplates.service';
import * as appController from 'src/app.controller';

@Controller('templates')
export class TrainingtemplatesController {
  constructor(private readonly templateService: TrainingtemplatesService) {}

  @Post()
  async createNewTemplate(
    @Body() createDto: TemplateRequestDto,
    @Request() req: appController.AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.templateService.create(createDto, userId);
  }

  @Put(':id')
  async updateTemplate(
    @Request() req: appController.AuthenticatedRequest,
    @Param('id') id: string,
    @Body() reqDto: TemplateRequestDto,
  ) {
    const userId = req.user.userId;
    return this.templateService.updateTemplateForUser(userId, reqDto, id);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteTemplate(
    @Request() req: appController.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    await this.templateService.deleteTemplateForUser(userId, id);
  }

  @Get(':id')
  async findTemplate(
    @Param('id') id: string,
    @Request() req: appController.AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.templateService.findTemplateForUser(userId, id);
  }

  @Get()
  async findAllForUser(
    @Request() req: appController.AuthenticatedRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.userId;
    return this.templateService.findAllForUser(userId, page, limit);
  }
}
