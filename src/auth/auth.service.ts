import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(email);

    if (!user || user.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
