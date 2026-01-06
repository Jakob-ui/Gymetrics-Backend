import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { RequestUserDto } from './dtos/Request/user.request.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(requestDto: RequestUserDto): Promise<User> {
    const newUser = new this.userModel(requestDto);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, requestDto: RequestUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, requestDto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async findOne(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
