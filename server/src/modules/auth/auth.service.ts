import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

type UserResult = {
  userId: string;
  userName: string;
  email: string;
};
export type AuthResult = {
  accessToken: string;
  refreshToken: string;
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
    const authenticated = await compare(password, user.password);
    if (user && authenticated) {
      return {
        userId: user._id.toString(),
        userName: user.name,
        email: user.email,
      };
    }

    return null;
  }

  async generateTokens(user: UserResult) {
    const tokenPayload = { email: user.email, sub: user.userId };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<UserResult | null> {
    const user = await this.userService.findById(userId);
    if (!user) {
      return null;
    }

    const isValid = user.refreshToken
      ? await compare(refreshToken, user.refreshToken)
      : false;
    if (isValid) {
      return {
        userId: user._id.toString(),
        userName: user.name,
        email: user.email,
      };
    }

    return null;
  }

  async login(user: UserResult): Promise<AuthResult> {
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Store the refresh token in the database
    await this.userService.updateRefreshToken(user.userId, refreshToken);

    return {
      accessToken,
      refreshToken,
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
