import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

type UserResult = {
  userId: string;
  userName: string;
  email: string;
};
export type AuthResult = {
  accessToken: string;
  userId: string;
  name: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResult | null> {
    const user = await this.userService.findByEmail(email);

    if (user && user.password === password) {
      return {
        userId: user._id.toString(),
        userName: user.name,
        email: user.email,
      };
    }

    return null;
  }

  async login(user: UserResult): Promise<AuthResult> {
    const tokenPayload = { email: user.email, sub: user.userId };

    return {
      accessToken: await this.jwtService.signAsync(tokenPayload),
      userId: user.userId,
      name: user.userName,
    };
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.login(user);
  }
}
