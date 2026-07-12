import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { RegisterDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './auth.dto';
import { AuthError } from './auth.error';
import { AUTH_CONSTANTS, forgotPasswordEmailHtml, resetPasswordSuccessEmailHtml } from './auth.constant';
import { MailerService } from '../../infrastructures/mailer/mailer.service';
import { IUserRequest } from '../../common/interfaces/user-request.interface';

export interface GoogleProfile {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    const [existingUser, existingEmail] = await Promise.all([
      this.repo.findByUsername(dto.username),
      this.repo.findByEmail(dto.email),
    ]);
    if (existingUser) throw AuthError.usernameTaken(dto.username);
    if (existingEmail) throw AuthError.emailTaken(dto.email);

    const passwordHash = await bcrypt.hash(
      dto.password,
      AUTH_CONSTANTS.BCRYPT_ROUNDS,
    );
    const user = await this.repo.createUser({
      username: dto.username,
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.repo.findByUsername(dto.username);
    if (!user) throw AuthError.userNotFound(dto.username);
    if (!user.passwordHash) throw AuthError.googleLoginOnly();

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw AuthError.invalidPassword();

    return this.generateTokens(user);
  }

  async handleGoogleLogin(profile: GoogleProfile) {
    const user = await this.repo.findByGoogleId(profile.googleId);
    if (user) return user;

    const existingEmail = await this.repo.findByEmail(profile.email);
    if (existingEmail) {
      return this.repo.linkGoogle(existingEmail.id, profile.googleId);
    }

    const base = profile.email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase()
      .slice(0, 30);
    let username = base;
    let suffix = 1;
    while (await this.repo.findByUsername(username)) {
      username = `${base}${suffix}`.slice(0, 30);
      suffix++;
    }

    return this.repo.createUser({
      username,
      email: profile.email,
      passwordHash: null,
      displayName: profile.displayName,
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl,
    });
  }

  async refresh(refreshToken: string) {
    const stored = await this.repo.findRefreshToken(refreshToken);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw AuthError.invalidRefreshToken();
    }

    await this.repo.revokeRefreshToken(refreshToken);

    const user = await this.repo.findById(stored.userId);
    if (!user) throw AuthError.userDeleted();

    return this.generateTokens(user);
  }

  async logout(refreshToken: string) {
    await this.repo.revokeRefreshToken(refreshToken);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.repo.findById(userId);
    if (!user) throw AuthError.userNotFound('unknown');

    if (!user.passwordHash) throw AuthError.googleLoginOnly();

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw AuthError.invalidPassword();

    const same = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (same) throw AuthError.samePassword();

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      AUTH_CONSTANTS.BCRYPT_ROUNDS,
    );
    await this.repo.updatePassword(userId, passwordHash);
    await this.repo.revokeUserRefreshTokens(userId);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.repo.findByEmail(dto.email);
    if (!user) throw AuthError.userNotFoundByEmail(dto.email);
    if (!user.passwordHash) throw AuthError.googleLoginOnly();

    const otpCode = crypto
      .randomInt(0, 10 ** AUTH_CONSTANTS.OTP_LENGTH)
      .toString()
      .padStart(AUTH_CONSTANTS.OTP_LENGTH, '0');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + AUTH_CONSTANTS.OTP_EXPIRY_MINUTES);

    await this.repo.createOtp({
      userId: user.id,
      email: dto.email,
      otpCode,
      expiresAt,
    });

    const html = forgotPasswordEmailHtml(otpCode, user.displayName);
    const sent = await this.mailer.sendMail(dto.email, 'Đặt lại mật khẩu — Recalio', html);

    if (!sent) {
      throw new InternalServerErrorException('Không thể gửi email, vui lòng thử lại sau');
    }

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otp = await this.repo.findValidOtp(dto.email, dto.otpCode);
    if (!otp) throw AuthError.otpInvalidOrExpired();

    return { message: 'Mã OTP hợp lệ' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const otp = await this.repo.findValidOtp(dto.email, dto.otpCode);
    if (!otp) throw AuthError.otpInvalidOrExpired();

    await this.repo.markOtpUsed(otp.id);

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      AUTH_CONSTANTS.BCRYPT_ROUNDS,
    );
    await this.repo.updatePassword(otp.userId, passwordHash);
    await this.repo.revokeUserRefreshTokens(otp.userId);

    const user = await this.repo.findById(otp.userId);
    if (user) {
      const html = resetPasswordSuccessEmailHtml(user.displayName);
      await this.mailer.sendMail(dto.email, 'Mật khẩu đã được đặt lại — Recalio', html);
    }

    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }

  async generateTokens(user: IUserRequest) {
    const accessToken = this.jwt.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = crypto
      .randomBytes(AUTH_CONSTANTS.REFRESH_TOKEN_BYTES)
      .toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.repo.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      device: null,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName ?? user.username,
        avatarUrl: user.avatarUrl ?? null,
        role: user.role,
      },
    };
  }
}
