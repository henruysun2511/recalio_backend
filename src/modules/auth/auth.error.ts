import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

export class AuthError {
  static userNotFound(username: string) {
    return new NotFoundException(`Người dùng "${username}" không tồn tại`);
  }

  static usernameTaken(username: string) {
    return new ConflictException(
      `Tên người dùng "${username}" đã được sử dụng`,
    );
  }

  static emailTaken(email: string) {
    return new ConflictException(`Email "${email}" đã được sử dụng`);
  }

  static invalidPassword() {
    return new UnauthorizedException('Mật khẩu không chính xác');
  }

  static invalidRefreshToken() {
    return new UnauthorizedException(
      'Refresh token không hợp lệ hoặc đã hết hạn',
    );
  }

  static userDeleted() {
    return new UnauthorizedException('Tài khoản đã bị xóa');
  }

  static googleIdExists() {
    return new ConflictException('Tài khoản này đã liên kết với Google');
  }

  static googleLoginOnly() {
    return new UnauthorizedException(
      'Tài khoản này dùng Google đăng nhập, vui lòng đăng nhập bằng Google',
    );
  }

  static samePassword() {
    return new UnauthorizedException(
      'Mật khẩu mới không được trùng với mật khẩu hiện tại',
    );
  }

  static userNotFoundByEmail(email: string) {
    return new NotFoundException(`Không tìm thấy tài khoản với email "${email}"`);
  }

  static otpInvalidOrExpired() {
    return new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
  }

  static otpAlreadyUsed() {
    return new BadRequestException('Mã OTP đã được sử dụng');
  }
}
