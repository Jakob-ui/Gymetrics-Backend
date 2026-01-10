import { Body, Controller, Get, Delete, Put, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRequestDto } from './dtos/Request/updateUser.request.dto';
import { UserResponseDto } from './dtos/Response/user.response.dto';
import { UserProfileResponseDto } from './dtos/Response/userProfile.response.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findById(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserResponseDto> {
    const userId = req.user.userId;
    return this.userService.findById(userId);
  }

  @Get('profile')
  async findProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserProfileResponseDto> {
    const userId = req.user.userId;
    return this.userService.findProfile(userId);
  }

  @Put()
  async update(
    @Request() req: AuthenticatedRequest,
    @Body() requestDto: UserRequestDto,
  ): Promise<UserProfileResponseDto> {
    const userId = req.user.userId;
    return this.userService.update(userId, requestDto);
  }

  @Delete()
  async delete(@Request() req: AuthenticatedRequest): Promise<boolean> {
    const userId = req.user.userId;
    return this.userService.delete(userId);
  }
}
