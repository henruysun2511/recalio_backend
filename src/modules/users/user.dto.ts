import { IsOptional, IsString, MaxLength, IsIn, IsBoolean, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
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

export class UserQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({ default: 'desc' })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}

export class UpdateUserRoleDto {
    @ApiPropertyOptional({ enum: UserRole })
    @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
    role: UserRole;
}
