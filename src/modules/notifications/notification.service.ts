import { Injectable, Logger } from '@nestjs/common';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { NotificationRepository } from './notification.repository';
import { NotificationError } from './notification.error';
import { UpdateSettingsDto, NotificationQueryDto, NotificationSettingResponseDto, CreateNotificationDto } from './notification.dto';
import { NotificationProducer } from '../../infrastructures/queue/producers/notification.producer';
import { NOTIFICATION_CONSTANTS } from './notification.constant';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    private readonly EMAIL_ELIGIBLE_TYPES = new Set<NotificationType>([
        NotificationType.STUDY_REMINDER,
        NotificationType.CARDS_DUE,
        NotificationType.SYSTEM,
    ]);

    constructor(
        private readonly repo: NotificationRepository,
        private readonly notificationProducer: NotificationProducer,
    ) { }

    async getSettings(userId: string): Promise<NotificationSettingResponseDto> {
        const settings = await this.repo.getSettings(userId);
        return settings ?? { emailEnabled: true, pushEnabled: true, studyReminder: true, reminderTime: '20:00' };
    }

    async updateSettings(userId: string, dto: UpdateSettingsDto) {
        const updated = await this.repo.upsertSettings(userId, dto as any);
        this.logger.log(`User ${userId}: updated notification settings`);
        return updated;
    }

    async list(userId: string, dto: NotificationQueryDto) {
        const page = dto.page ?? 1;
        const limit = dto.limit ?? NOTIFICATION_CONSTANTS.DEFAULT_LIMIT;

        const where: Record<string, unknown> = {};
        if (dto.type) where.type = dto.type;
        if (dto.isRead !== undefined) where.isRead = dto.isRead;

        const { items, total } = await this.repo.findMany(userId, where as any, page, limit);
        return paginate(items, total, { page, limit } as PaginationDto);
    }

    async markAsRead(userId: string, id: string) {
        const notif = await this.repo.findById(id);
        if (!notif) throw NotificationError.notFound();
        if (notif.userId !== userId) throw NotificationError.notFound();

        await this.repo.markAsRead(id);
    }

    async markAllAsRead(userId: string) {
        await this.repo.markAllAsRead(userId);
    }

    async countUnread(userId: string) {
        return { unread: await this.repo.countUnread(userId) };
    }

    async createNotification(adminId: string, dto: CreateNotificationDto) {
        const { userId, type: rawType, title, body, data, channel } = dto;
        const type = rawType ?? NotificationType.SYSTEM;

        const resolvedChannel = channel ?? (userId ? NotificationChannel.WEB_PUSH : NotificationChannel.EMAIL);
        if (resolvedChannel === NotificationChannel.EMAIL && !this.EMAIL_ELIGIBLE_TYPES.has(type)) {
            throw NotificationError.channelNotAllowed();
        }

        if (userId) {
            await this.notificationProducer.addSendJob({
                userId,
                type,
                title,
                body,
                data,
                channel: resolvedChannel,
            });
            this.logger.log(`Admin ${adminId}: queued notification to user ${userId}`);
            return { queued: true };
        }

        await this.notificationProducer.addBroadcastJob({
            adminId,
            type,
            title,
            body,
            data,
            channel: resolvedChannel,
        });
        this.logger.log(`Admin ${adminId}: queued broadcast notification`);
        return { queued: true };
    }

    async notifyUser(userId: string, type: NotificationType, title: string, body?: string, data?: Record<string, unknown>) {
        await this.notificationProducer.addSendJob({
            userId,
            type,
            title,
            body,
            data,
            channel: NotificationChannel.WEB_PUSH,
        });
        this.logger.log(`Notification queued for user ${userId}: ${type}`);
    }
}
