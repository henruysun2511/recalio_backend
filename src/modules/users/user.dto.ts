import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { USER_CONSTANTS } from './user.constant';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsOptional()
    @IsString({ message: 'Tên hiển thị phải là chuỗi kí tự' })
    @MaxLength(USER_CONSTANTS.DISPLAY_NAME_MAX_LENGTH, { message: 'Tên hiển thị không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    displayName?: string;

    @ApiPropertyOptional({ example: 'Xin chào, tôi là John' })
    @IsOptional()
    @IsString({ message: 'Bio phải là chuỗi kí tự' })
    @MaxLength(USER_CONSTANTS.BIO_MAX_LENGTH, { message: 'Bio không được quá 500 kí tự' })
    @Transform(({ value }) => value?.trim())
    bio?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    @IsOptional()
    @IsString({ message: 'Avatar URL phải là chuỗi kí tự' })
    avatarUrl?: string;
}
