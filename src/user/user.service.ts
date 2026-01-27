import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UserRequestDto } from './dtos/Request/updateUser.request.dto';
import { UserProfileResponseDto } from './dtos/Response/userProfile.response.dto';
import { UserResponseDto } from './dtos/Response/user.response.dto';
import { RefreshRequestDto } from 'src/auth/dtos/Request/refresh.request.dto';
import { RefreshUserResponseDto } from './dtos/Response/refreshUser.response.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return User.mapToUserResponseDto(user);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async findProfile(id: string): Promise<UserProfileResponseDto> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return User.mapToProfileResponseDto(user);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async findProfileRefresh(id: string): Promise<RefreshUserResponseDto> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user || !user.refreshToken) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      const response = new RefreshUserResponseDto();
      response.refreshToken = user.refreshToken;
      response.userId = user.id;
      response.name = user.name;
      return response;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async update(
    id: string,
    requestDto: UserRequestDto,
  ): Promise<UserProfileResponseDto> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, requestDto, { new: true })
        .exec();
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      return User.mapToProfileResponseDto(user);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async refreshTokenUpdate(id: string, requestDto: RefreshRequestDto) {
    const updateData = {
      refreshToken: requestDto.refresh_token,
    };
    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const user = await this.userModel.findByIdAndDelete(id).exec();
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      return true;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async findOne(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
