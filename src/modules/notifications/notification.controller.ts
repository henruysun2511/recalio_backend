import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  UpdateSettingsDto,
  NotificationQueryDto,
  CreateNotificationDto,
  NotificationSettingResponseDto,
  NotificationResponseDto,
} from './notification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller()
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get('notification-settings')
  @ResponseMessage('Lấy cài đặt thông báo')
  @SwaggerDoc({
    summary: 'Get notification settings',
    responseType: NotificationSettingResponseDto,
  })
  async getSettings(@CurrentUser('id') userId: string) {
    return this.service.getSettings(userId);
  }

  @Patch('notification-settings')
  @ResponseMessage('Cập nhật cài đặt thông báo')
  @SwaggerDoc({
    summary: 'Update notification settings',
    bodyType: UpdateSettingsDto,
  })
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.service.updateSettings(userId, dto);
  }

  @Get('notifications')
  @ResponseMessage('Lấy danh sách thông báo')
  @SwaggerDoc({
    summary: 'List notifications',
    responseType: NotificationResponseDto,
    isArray: true,
  })
  async list(
    @CurrentUser('id') userId: string,
    @Query() dto: NotificationQueryDto,
  ) {
    return this.service.list(userId, dto);
  }

  @Get('notifications/unread-count')
  @ResponseMessage('Lấy số thông báo chưa đọc')
  @SwaggerDoc({ summary: 'Count unread notifications' })
  async countUnread(@CurrentUser('id') userId: string) {
    return this.service.countUnread(userId);
  }

  @Patch('notifications/read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Đánh dấu tất cả đã đọc')
  @SwaggerDoc({ summary: 'Mark all as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.service.markAllAsRead(userId);
  }

  @Patch('notifications/:id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Đánh dấu đã đọc')
  @SwaggerDoc({ summary: 'Mark a notification as read' })
  async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.service.markAsRead(userId, id);
  }

  @Post('notifications')
  @Roles('ADMIN')
  @ResponseMessage('Gửi thông báo')
  @SwaggerDoc({
    summary: 'Admin: send notification',
    bodyType: CreateNotificationDto,
  })
  async create(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.service.createNotification(adminId, dto);
  }
}
