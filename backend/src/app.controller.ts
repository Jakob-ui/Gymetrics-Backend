import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
export interface AuthenticatedRequest extends Request {
  user: { userId: string };
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  ping(): { status: string; timestamp: Date; message: string } {
    return {
      status: 'ok',
      message: 'Gymetrics backend here',
      timestamp: new Date(),
    };
  }
}
