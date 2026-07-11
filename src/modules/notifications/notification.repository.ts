import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import {
  Prisma,
  NotificationType,
  NotificationChannel,
  CardState,
} from '@prisma/client';

const notifSelect = {
  id: true,
  type: true,
  title: true,
  body: true,
  data: true,
  isRead: true,
  channel: true,
  sentAt: true,
} satisfies Prisma.NotificationSelect;

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    return this.prisma.notificationSetting.findUnique({ where: { userId } });
  }

  async upsertSettings(
    userId: string,
    data: Prisma.NotificationSettingUpdateInput,
  ) {
    return this.prisma.notificationSetting.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data } as any,
      select: {
        emailEnabled: true,
        pushEnabled: true,
        studyReminder: true,
        reminderTime: true,
      },
    });
  }

  async findMany(
    userId: string,
    where?: Prisma.NotificationWhereInput,
    page = 1,
    limit = 20,
  ) {
    const baseWhere: Prisma.NotificationWhereInput = {
      userId,
      ...(where ?? {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: baseWhere,
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: notifSelect,
      }),
      this.prisma.notification.count({ where: baseWhere }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
      select: { ...notifSelect, userId: true },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: notifSelect,
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async createOne(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({ data, select: notifSelect });
  }

  async createMany(data: Prisma.NotificationCreateManyInput[]) {
    await this.prisma.notification.createMany({ data });
  }

  async getEligibleUserIds(channel: string) {
    const channelField =
      channel === NotificationChannel.EMAIL
        ? ('emailEnabled' as const)
        : ('pushEnabled' as const);

    const users = await this.prisma.user.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (!users.length) return [];

    const settings = await this.prisma.notificationSetting.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
      select: { userId: true, emailEnabled: true, pushEnabled: true },
    });
    const settingsMap = new Map(
      settings.map((s) => [s.userId, s[channelField]]),
    );

    return users.filter((u) => settingsMap.get(u.id) ?? true).map((u) => u.id);
  }

  async findUsersWithStudyReminder(now: Date) {
    // 1. Lấy tất cả múi giờ duy nhất của người dùng đang hoạt động
    const usersWithTimezones = await this.prisma.user.findMany({
      where: { isActive: true, deletedAt: null },
      distinct: ['timezone'],
      select: { timezone: true },
    });

    const matchingUserIds: string[] = [];

    for (const { timezone } of usersWithTimezones) {
      let localTime = '20:00';
      try {
        // Tính giờ địa phương tương ứng (HH:mm) cho múi giờ này
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        }).formatToParts(now);
        const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '00';
        const minutePart =
          parts.find((p) => p.type === 'minute')?.value ?? '00';
        const hour = String(parseInt(hourPart, 10) % 24).padStart(2, '0');
        const minute = minutePart.padStart(2, '0');
        localTime = `${hour}:${minute}`;
      } catch (e) {
        // Nếu múi giờ không hợp lệ, bỏ qua
        continue;
      }

      const isDefaultTime = localTime === '20:00';

      // Tìm những người dùng có thiết lập nhắc học khớp với localTime
      // Hoặc có thiết lập mặc định (notifSetting là null) nếu localTime là 20:00
      const users = await this.prisma.user.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          timezone,
          OR: [
            {
              notifSetting: {
                studyReminder: true,
                reminderTime: localTime,
                emailEnabled: true,
              },
            },
            isDefaultTime
              ? {
                  notifSetting: null,
                }
              : undefined,
          ].filter(Boolean) as any,
        },
        select: { id: true },
      });

      matchingUserIds.push(...users.map((u) => u.id));
    }

    return matchingUserIds;
  }

  async findUsersWithDueCards() {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        cards: {
          some: {
            due: { lte: new Date() },
            state: { not: CardState.SUSPENDED },
          },
        },
        OR: [{ notifSetting: null }, { notifSetting: { emailEnabled: true } }],
      } as any,
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  async countDueCards(userId: string) {
    return this.prisma.card.count({
      where: {
        userId,
        due: { lte: new Date() },
        state: { not: CardState.SUSPENDED },
      } as any,
    });
  }

  async hasRecentNotification(
    userId: string,
    type: NotificationType,
    since: Date,
  ) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        type: type as any,
        sentAt: { gte: since },
      },
    });
    return count > 0;
  }

  async findUnsentEmails() {
    const notifications = await this.prisma.notification.findMany({
      where: {
        channel: NotificationChannel.EMAIL,
        emailSentAt: null,
        type: {
          in: [
            NotificationType.STUDY_REMINDER,
            NotificationType.CARDS_DUE,
            NotificationType.SYSTEM,
          ],
        },
        user: { isActive: true, deletedAt: null },
      } as any,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        user: { select: { id: true, email: true, displayName: true } },
      },
      orderBy: { sentAt: 'asc' },
    });
    if (!notifications.length) return [];

    const userIds = [...new Set(notifications.map((n) => n.user.id))];
    const settings = await this.prisma.notificationSetting.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, emailEnabled: true },
    });
    const disabled = new Set(
      settings.filter((s) => !s.emailEnabled).map((s) => s.userId),
    );

    // Đánh dấu ngay các thông báo của user đã tắt nhận mail làm 'đã gửi'
    // để tránh việc cron quét lại các bản ghi này ở lần chạy tiếp theo.
    const disabledNotifIds = notifications
      .filter((n) => disabled.has(n.user.id))
      .map((n) => n.id);
    if (disabledNotifIds.length > 0) {
      await this.markEmailSent(disabledNotifIds);
    }

    return notifications.filter((n) => !disabled.has(n.user.id));
  }

  async markEmailSent(ids: string[]) {
    if (!ids.length) return;
    await this.prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { emailSentAt: new Date() } as any,
    });
  }
}
