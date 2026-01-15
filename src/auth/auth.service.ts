import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
import { RefreshRequestDto } from './Request/refresh.request.dto';
import * as crypto from 'crypto';
import { ValidationResponseDto } from './Response/validation.response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private configService: ConfigService,
  ) {}

  //Brauch ich damit der Hash nicht zu lang ist vom jwt und damit übereinstimmt
  private hashTokenForBcrypt(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async getTokens(userId: string, username: string) {
    const payload = { userId, username };
    const secret = this.configService.get<string>('JWT_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: secret,
        expiresIn: '6h',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '31d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const sha256Hash = this.hashTokenForBcrypt(refreshToken);
    const hash = await bcrypt.hash(sha256Hash, 10);
    const request: RefreshRequestDto = { refresh_token: hash };
    await this.userService.refreshTokenUpdate(userId, request);
  }

  async signIn(email: string, pass: string): Promise<AuthResponseDto> {
    const user = await this.userService.findOne(email);

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }

    const tokens = await this.getTokens(user._id.toString(), user.name);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return new AuthResponseDto({
      userId: user._id.toString(),
      name: user.name,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  async register(registerDto: RegisterRequestDto): Promise<AuthResponseDto> {
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

    return userResponse;
  }

  async validate(userId: string): Promise<ValidationResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('user not found');
    return new ValidationResponseDto({
      userId: user.id.toString(),
      name: user.name,
    });
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    const refresh = await this.userService.findProfileRefresh(userId);

    if (!refresh || !refresh.refreshToken)
      throw new ForbiddenException('Access Denied');

    const sha256Hash = this.hashTokenForBcrypt(refreshToken);

    const refreshTokenMatches = await bcrypt.compare(
      sha256Hash,
      refresh.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(refresh.userId, refresh.name);

    await this.updateRefreshTokenHash(refresh.userId, tokens.refreshToken);

    return new AuthResponseDto({
      userId: refresh.userId,
      name: refresh.name,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }
}
