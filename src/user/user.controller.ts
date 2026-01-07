import { Body, Controller, Get, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRequestDto } from './dtos/Request/user.request.dto';
import { UserResponseDto } from './dtos/Response/user.response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() requestDto: UserRequestDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, requestDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
