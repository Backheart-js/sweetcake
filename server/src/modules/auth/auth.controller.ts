import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthResult, AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from 'src/shared/guards/auth.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResult> {
    return this.authService.authenticate(loginDto.email, loginDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(
    @Request() req: { user: { id: string; name: string; email: string } },
  ) {
    return {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    };
  }
}
