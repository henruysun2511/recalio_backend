import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from '../../../config/jwt.config';

interface JwtPayload {
    sub: string;      // userId
    username: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JwtConfig.ACCESS_TOKEN_SECRET,
        });
    }

    async validate(payload: JwtPayload) {
        return { id: payload.sub, username: payload.username, role: payload.role };
    }
}
