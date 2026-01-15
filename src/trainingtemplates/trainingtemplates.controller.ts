import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TemplateRequestDto } from './dtos/Request/template.request.dto';
import { TrainingtemplatesService } from './trainingtemplates.service';
import * as appController from 'src/app.controller';
import { TrainingTemplate } from './schemas/trainingtemplates.schema';
import { TemplateResponseDto } from './dtos/Response/template.response.dto';
import { TemplateOverviewResponseDto } from './dtos/Response/templateoverview.response.dto';
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
@Controller('templates')
export class TrainingtemplatesController {
  constructor(private readonly templateService: TrainingtemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training template' })
  @ApiOkResponse({
    type: TrainingTemplate,
    description: 'Template created successfully',
  })
  async createNewTemplate(
    @Body() createDto: TemplateRequestDto,
    @Request() req: appController.AuthenticatedRequest,
  ): Promise<TrainingTemplate> {
    const userId = req.user.userId;
    return this.templateService.create(createDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a training template' })
  @ApiOkResponse({
    type: TemplateResponseDto,
    description: 'Template updated successfully',
  })
  async updateTemplate(
    @Request() req: appController.AuthenticatedRequest,
    @Param('id') id: string,
    @Body() reqDto: TemplateRequestDto,
  ): Promise<TemplateResponseDto> {
    const userId = req.user.userId;
    return this.templateService.updateTemplateForUser(userId, reqDto, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training template' })
  @ApiOkResponse({ description: 'Template deleted successfully' })
  @HttpCode(204)
  async deleteTemplate(
    @Request() req: appController.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    await this.templateService.deleteTemplateForUser(userId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific training template' })
  @ApiOkResponse({ type: TemplateResponseDto, description: 'Template details' })
  async findTemplate(
    @Param('id') id: string,
    @Request() req: appController.AuthenticatedRequest,
  ): Promise<TemplateResponseDto> {
    const userId = req.user.userId;
    return this.templateService.findTemplateForUser(userId, id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all training templates for the user' })
  @ApiOkResponse({
    type: [TemplateOverviewResponseDto],
    description: 'List of training templates',
  })
  async findAllForUser(
    @Request() req: appController.AuthenticatedRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<TemplateOverviewResponseDto[]> {
    const userId = req.user.userId;
    return this.templateService.findAllForUser(userId, page, limit);
  }
}
