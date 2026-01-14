import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UserRequestDto } from './dtos/Request/updateUser.request.dto';
import { UserProfileResponseDto } from './dtos/Response/userProfile.response.dto';
import { UserResponseDto } from './dtos/Response/user.response.dto';
import { RefreshRequestDto } from 'src/auth/Request/refresh.request.dto';
import { RefreshUserResponseDto } from './dtos/Response/refreshUser.response.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return User.mapToUserResponseDto(user);
  }

  async findProfile(id: string): Promise<UserProfileResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return User.mapToProfileResponseDto(user);
  }

  async findProfileRefresh(id: string): Promise<RefreshUserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user || !user.refreshToken) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const response = new RefreshUserResponseDto();
    response.refreshToken = user.refreshToken;
    response.userId = user.id;
    response.name = user.name;
    return response;
  }

  async update(
    id: string,
    requestDto: UserRequestDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.userModel
      .findByIdAndUpdate(id, requestDto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return User.mapToProfileResponseDto(user);
  }

  async refreshTokenUpdate(id: string, requestDto: RefreshRequestDto) {
    const updateData = {
      refreshToken: requestDto.refresh_token,
    };

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return true;
  }

  async findOne(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
