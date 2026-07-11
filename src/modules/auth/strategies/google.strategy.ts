import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleConfig } from '../../../config/google.config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: GoogleConfig.CLIENT_ID,
      clientSecret: GoogleConfig.CLIENT_SECRET,
      callbackURL: GoogleConfig.CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      emails?: { value: string }[];
      displayName?: string;
      photos?: { value: string }[];
    },
    done: VerifyCallback,
  ) {
    const user = await this.authService.handleGoogleLogin({
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      displayName:
        profile.displayName ?? profile.emails?.[0]?.value ?? 'Unknown',
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });

    done(null, user);
  }
}
