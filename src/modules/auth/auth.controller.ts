import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from './auth.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
import { AppConfig } from '../../config/app.config';
import type { IUserRequest } from '../../common/interfaces/user-request.interface';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  @Public()
  @ResponseMessage('Đăng ký thành công')
  @SwaggerDoc({
    summary: 'Register new account',
    bodyType: RegisterDto,
    status: 201,
  })
  async register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Đăng nhập thành công')
  @SwaggerDoc({ summary: 'Login', bodyType: LoginDto })
  async login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  @SwaggerDoc({ summary: 'Redirect to Google OAuth consent screen' })
  googleAuth() {}

  @Get('callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @SwaggerDoc({ summary: 'Google OAuth callback' })
  async googleCallback(
    @CurrentUser() user: IUserRequest,
    @Res() res: Response,
  ) {
    const tokens = await this.service.generateTokens(user);
    const query = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.id,
      username: user.username,
      displayName: user.displayName ?? user.username,
      avatarUrl: user.avatarUrl ?? '',
      role: user.role,
    }).toString();
    res.redirect(`${AppConfig.CLIENT_URL}/auth/callback?${query}`);
  }

  @Post('refresh-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cấp lại token thành công')
  @SwaggerDoc({ summary: 'Refresh access token', bodyType: RefreshTokenDto })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.service.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Đăng xuất thành công')
  @SwaggerDoc({ summary: 'Logout (revoke refresh token)' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.service.logout(dto.refreshToken);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Đổi mật khẩu thành công')
  @SwaggerDoc({ summary: 'Change password', bodyType: ChangePasswordDto })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.service.changePassword(userId, dto);
  }
}
