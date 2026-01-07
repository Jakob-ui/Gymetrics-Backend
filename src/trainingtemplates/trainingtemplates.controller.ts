import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { TemplateRequestDto } from './Request/template.request.dto';
import { TrainingtemplatesService } from './trainingtemplates.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('templates')
export class TrainingtemplatesController {
  constructor(private readonly templateService: TrainingtemplatesService) {}

  @Post('create')
  async createNewTemplate(
    @Body() createDto: TemplateRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.templateService.create(createDto, userId);
  }

  @Get()
  async findAllForUser(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.templateService.findAllForUser(userId);
  }
}
