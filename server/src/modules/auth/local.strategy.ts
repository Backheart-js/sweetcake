import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Tùy theo trường nhập vào, mặc định là username và password
    // Nếu bạn muốn sử dụng email và password thì cần phải chỉ định lại
    super({ 
        usernameField: 'email'
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.authenticate(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
