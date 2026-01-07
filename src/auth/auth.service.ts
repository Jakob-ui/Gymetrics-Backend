import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterRequestDto } from './Request/register.request.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Auth } from './schemas/auth.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AuthResponseDto } from './Response/auth.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ AuthResponseDto: AuthResponseDto }> {
    const user = await this.userService.findOne(email);

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = { userId: user._id, username: user.name };
    const access_token = await this.jwtService.signAsync(payload);

    const userResponse: AuthResponseDto = {
      userId: user._id.toString(),
      name: user.name,
      token: access_token,
    };
    return { AuthResponseDto: userResponse };
  }

  async register(
    registerDto: RegisterRequestDto,
  ): Promise<{ AuthResponseDto: AuthResponseDto }> {
    const existingUser = await this.userService.findOne(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists!');
    }
    if (!registerDto.password) {
      throw new BadRequestException('Password required!');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = new this.authModel({
      ...registerDto,
      password: hashedPassword,
    });
    await newUser.save();
    const userResponse = await this.signIn(newUser.email, registerDto.password);
    if (!userResponse) {
      throw new BadRequestException('Login Failed');
    }

    return { AuthResponseDto: userResponse.AuthResponseDto };
  }
}
