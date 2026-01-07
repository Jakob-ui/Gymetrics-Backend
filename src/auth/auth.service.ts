import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RequestRegisterDto } from './Request/register.request.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Auth } from './schemas/auth.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(email);

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(
    registerDto: RequestRegisterDto,
  ): Promise<{ access_token: string }> {
    if (!registerDto.password) {
      throw new BadRequestException('Password required!');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = new this.authModel({
      ...registerDto,
      password: hashedPassword,
    });
    await newUser.save();

    return this.signIn(newUser.email, registerDto.password);
  }
}
