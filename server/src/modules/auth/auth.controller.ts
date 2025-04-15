import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthGuard } from 'src/shared/guards/auth.guards';
import { LocalAuthGuard } from 'src/shared/guards/passport-local.guards';
import { JwtAuthGuard } from 'src/shared/guards/passport-jwt.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Request() req: { user: { email: string; password: string } }) {
    return req.user;
  }

  @Post('logout')
  logout(@Request() req: { logout: () => void }) {
    req.logout();
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(
    @Request() req: { user: { id: string; name: string; email: string } },
  ) {
    return req.user;
  }
}
