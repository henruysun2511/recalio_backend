import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { NOTIFICATION_CONSTANTS } from './notification.constant';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'emailEnabled phải là boolean' })
  @Transform(({ value }) => value === true || value === 'true')
  emailEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'pushEnabled phải là boolean' })
  @Transform(({ value }) => value === true || value === 'true')
  pushEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'studyReminder phải là boolean' })
  @Transform(({ value }) => value === true || value === 'true')
  studyReminder?: boolean;

  @ApiPropertyOptional({ example: '20:00' })
  @IsOptional()
  @IsString({ message: 'reminderTime phải là chuỗi' })
  reminderTime?: string;
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType, { message: 'type không hợp lệ' })
  type?: NotificationType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'isRead phải là boolean' })
  @Transform(({ value }) => value === true || value === 'true')
  isRead?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page tối thiểu là 1' })
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1)
  @Max(NOTIFICATION_CONSTANTS.MAX_LIMIT, {
    message: `limit tối đa là ${NOTIFICATION_CONSTANTS.MAX_LIMIT}`,
  })
  limit?: number;
}

export class NotificationSettingResponseDto {
  emailEnabled: boolean;
  pushEnabled: boolean;
  studyReminder: boolean;
  reminderTime: string;
}

export class CreateNotificationDto {
  @ApiPropertyOptional({ enum: NotificationType, example: 'SYSTEM' })
  @IsOptional()
  @IsEnum(NotificationType, { message: 'type không hợp lệ' })
  type?: NotificationType;

  @ApiProperty({ example: 'Bảo trì hệ thống' })
  @IsString({ message: 'title phải là chuỗi' })
  @IsNotEmpty({ message: 'title không được để trống' })
  title: string;

  @ApiPropertyOptional({ example: 'Hệ thống sẽ bảo trì lúc 2h sáng' })
  @IsOptional()
  @IsString({ message: 'body phải là chuỗi' })
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: NotificationChannel, example: 'WEB_PUSH' })
  @IsOptional()
  @IsEnum(NotificationChannel, { message: 'channel không hợp lệ' })
  channel?: NotificationChannel;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Bỏ trống để gửi cho tất cả user',
  })
  @IsOptional()
  @IsString({ message: 'userId phải là chuỗi' })
  userId?: string;

  @ApiPropertyOptional({
    example: 'john_doe',
    description: 'Tên đăng nhập người nhận, thay thế cho userId',
  })
  @IsOptional()
  @IsString({ message: 'username phải là chuỗi' })
  username?: string;
}

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  channel: string;
  sentAt: Date;
}
