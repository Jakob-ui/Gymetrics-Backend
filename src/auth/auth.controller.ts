import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './Request/login.request.dto';
import { Public } from './decorators/public.decorator';
import { RegisterRequestDto } from './Request/register.request.dto';
import { RefreshAuthGuard } from './refresh/refresh.guard';
import { ValidationResponseDto } from './Response/validation.response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    refreshToken: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async signIn(@Body() signInDto: LoginRequestDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterRequestDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const refreshToken = req.user.refreshToken;
    if (!refreshToken)
      throw new BadRequestException('no Refresh token provided');
    return this.authService.refresh(userId, refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Get('validate')
  async checkStatus(
    @Request() req: AuthenticatedRequest,
  ): Promise<ValidationResponseDto> {
    const userId = req.user.userId;
    return await this.authService.validate(userId);
  }
}
