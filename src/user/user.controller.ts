import { Body, Controller, Get, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { RequestUserDto } from './dtos/Request/user.request.dto';
import { ResponseUserDto } from './dtos/Response/user.response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<ResponseUserDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ResponseUserDto> {
    return this.userService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() requestDto: RequestUserDto,
  ): Promise<ResponseUserDto> {
    return this.userService.update(id, requestDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
