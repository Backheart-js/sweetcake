import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

interface ValidatedPayload {
  [key: string]: any;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Lấy từ cookie
        (req: Request) => (req?.cookies?.refresh_token as string) || null,
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization') || '';
    const refreshToken = authHeader.replace('Bearer', '').trim();
    return { ...payload, refreshToken } as ValidatedPayload;
  }
}
