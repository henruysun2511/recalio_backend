import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AUTH_CONSTANTS } from './auth.constant';

export class RegisterDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString({ message: 'Tên người dùng phải là chuỗi kí tự' })
  @MinLength(AUTH_CONSTANTS.USERNAME_MIN_LENGTH, { message: 'Tên người dùng phải chứa ít nhất 3 kí tự' })
  @MaxLength(AUTH_CONSTANTS.USERNAME_MAX_LENGTH, { message: 'Tên người dùng phải chứa không quá 30 kí tự' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString({ message: 'Mật khẩu phải là chuỗi kí tự' })
  @MinLength(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH, { message: 'Mật khẩu phải chứa ít nhất 6 kí tự' })
  @MaxLength(AUTH_CONSTANTS.PASSWORD_MAX_LENGTH, { message: 'Mật khẩu phải chứa không quá 128 kí tự' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString({ message: 'Tên hiển thị phải là chuỗi kí tự' })
  @MinLength(1, { message: 'Tên hiển thị không được để trống' })
  @MaxLength(AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH, { message: 'Tên hiển thị phải chứa không quá 100 kí tự' })
  @Transform(({ value }) => value?.trim())
  displayName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString({ message: 'Tên người dùng phải là chuỗi kí tự' })
  @MinLength(AUTH_CONSTANTS.USERNAME_MIN_LENGTH, { message: 'Tên người dùng phải chứa ít nhất 3 kí tự' })
  @MaxLength(AUTH_CONSTANTS.USERNAME_MAX_LENGTH, { message: 'Tên người dùng phải chứa không quá 30 kí tự' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString({ message: 'Mật khẩu phải là chuỗi kí tự' })
  @MinLength(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH, { message: 'Mật khẩu phải chứa ít nhất 6 kí tự' })
  @MaxLength(AUTH_CONSTANTS.PASSWORD_MAX_LENGTH, { message: 'Mật khẩu phải chứa không quá 128 kí tự' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @IsString({ message: 'Refresh token phải là chuỗi kí tự' })
  refreshToken: string;
}

