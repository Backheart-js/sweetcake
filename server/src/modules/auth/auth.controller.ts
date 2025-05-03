import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthResult, AuthService } from './auth.service';
// import { AuthGuard } from 'src/shared/guards/auth.guards';
import { LocalAuthGuard } from 'src/shared/guards/passport-local.guards';
import { JwtAuthGuard } from 'src/shared/guards/passport-jwt.guards';
import { Response } from 'express';
import { RefreshJwtAuthGuard } from 'src/shared/guards/passport-refresh-jwt.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Request() req: { user: AuthResult },
    @Res({ passthrough: true }) response: Response,
  ) {
    response.cookie('refresh_token', req.user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { refreshToken, ...data } = req.user;
    return data;
  }

  @Post('refresh')
  @UseGuards(RefreshJwtAuthGuard)
  async refresh(
    @Request()
    req: Request & {
      user: { userId: string; email: string };
      cookies: { [key: string]: string };
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.['refresh_token'];
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.authService.validateRefreshToken(
        req.user.userId,
        token,
      );

      if (!payload) throw new UnauthorizedException();
      const user = await this.authService.validateUserById(req.user.userId);

      if (!user) throw new UnauthorizedException('User not found');
      const tokens = await this.authService.generateTokens(user);

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { accessToken: tokens.accessToken };
    } catch {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  logout(@Request() req: { logout: () => void }) {
    req.logout();
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: { user: { userId: string; email: string } }) {
    return req.user;
  }
}
