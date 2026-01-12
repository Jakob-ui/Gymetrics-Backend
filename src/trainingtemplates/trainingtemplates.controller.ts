import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { TemplateRequestDto } from './Request/template.request.dto';
import { TrainingtemplatesService } from './trainingtemplates.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('templates')
export class TrainingtemplatesController {
  constructor(private readonly templateService: TrainingtemplatesService) {}

  @Post()
  async createNewTemplate(
    @Body() createDto: TemplateRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.templateService.create(createDto, userId);
  }

  @Put(':id')
  async updateTemplate(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() reqDto: TemplateRequestDto,
  ) {
    const userId = req.user.userId;
    return this.templateService.updateTemplateForUser(userId, reqDto, id);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteTemplate(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    await this.templateService.deleteTemplateForUser(userId, id);
  }

  @Get(':id')
  async findTemplate(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.templateService.findTemplateForUser(userId, id);
  }

  @Get()
  async findAllForUser(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.templateService.findAllForUser(userId);
  }
}
