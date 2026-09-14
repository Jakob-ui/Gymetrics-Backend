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
import { TemplateQueryDto } from './dtos/Query/template.query.dto';
import { GenerateTemplateRequestDto } from './dtos/Request/generateTemplate.request.dto';
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
  async findTemplatesForUser(
    @Request() req: appController.AuthenticatedRequest,
    @Query() query: TemplateQueryDto,
  ): Promise<TemplateOverviewResponseDto[]> {
    return this.templateService.findTemplatesForUser(
      req.user.userId,
      query.page,
      query.limit,
      query.asc,
      query.sortBy,
      query.search,
    );
  }

  @Post('generate')
  @HttpCode(202)
  @ApiOperation({
    summary:
      'Kick off AI template generation - returns a placeholder immediately',
  })
  @ApiOkResponse({
    type: TemplateResponseDto,
    description: 'Placeholder template, still generating',
  })
  async generateTemplate(
    @Request() req: appController.AuthenticatedRequest,
    @Body() reqDto: GenerateTemplateRequestDto,
  ): Promise<TemplateResponseDto> {
    const userId = req.user.userId;
    return this.templateService.startAiGeneration(userId, reqDto);
  }
}
