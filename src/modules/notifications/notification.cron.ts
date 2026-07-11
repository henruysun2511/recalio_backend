import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { NotificationRepository } from './notification.repository';
import { NotificationProducer } from '../../infrastructures/queue/producers/notification.producer';

@Injectable()
export class NotificationCron {
  private readonly logger = new Logger(NotificationCron.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async createStudyReminders() {
    const now = new Date();

    const userIds = await this.repo.findUsersWithStudyReminder(now);
    if (!userIds.length) return;

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const created: string[] = [];
    for (const userId of userIds) {
      const exists = await this.repo.hasRecentNotification(
        userId,
        NotificationType.STUDY_REMINDER,
        today,
      );
      if (exists) continue;

      await this.repo.createOne({
        type: NotificationType.STUDY_REMINDER,
        title: 'Đã đến giờ học',
        body: 'Hãy dành chút thời gian ôn tập từ vựng nhé!',
        channel: NotificationChannel.EMAIL,
        user: { connect: { id: userId } },
      });
      created.push(userId);
    }

    if (created.length) {
      this.logger.log(`Created STUDY_REMINDER for ${created.length} users`);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async createCardsDueNotifications() {
    const userIds = await this.repo.findUsersWithDueCards();
    if (!userIds.length) return;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const created: string[] = [];
    for (const userId of userIds) {
      const exists = await this.repo.hasRecentNotification(
        userId,
        NotificationType.CARDS_DUE,
        since,
      );
      if (exists) continue;

      const count = await this.repo.countDueCards(userId);
      if (!count) continue;

      await this.repo.createOne({
        type: NotificationType.CARDS_DUE,
        title: 'Thẻ ôn tập đã đến hạn',
        body: `Bạn có ${count} thẻ cần ôn tập ngay bây giờ.`,
        channel: NotificationChannel.EMAIL,
        user: { connect: { id: userId } },
      });
      created.push(userId);
    }

    if (created.length) {
      this.logger.log(
        `Created CARDS_DUE for ${created.length} users (${userIds.length} have due cards)`,
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sendPendingEmails() {
    const notifications = await this.repo.findUnsentEmails();

    if (!notifications.length) return;

    const grouped = new Map<
      string,
      {
        ids: string[];
        email: string;
        name: string;
        items: { type: string; title: string; body: string | null }[];
      }
    >();

    for (const n of notifications) {
      const key = n.user.id;
      if (!grouped.has(key)) {
        grouped.set(key, {
          ids: [],
          email: n.user.email,
          name: n.user.displayName,
          items: [],
        });
      }
      const group = grouped.get(key)!;
      group.ids.push(n.id);
      group.items.push({ type: n.type, title: n.title, body: n.body });
    }

    // Đánh dấu ngay các thông báo này là đã gửi (hoặc đang gửi) trong DB trước khi đẩy vào BullMQ
    // Điều này ngăn chặn việc cron chạy lần tiếp theo quét trùng lặp trước khi hàng đợi xử lý xong.
    const allIds = notifications.map((n) => n.id);
    await this.repo.markEmailSent(allIds);

    for (const [, group] of grouped) {
      const itemsHtml = group.items
        .map((i) => `<li><b>${i.title}</b>${i.body ? `: ${i.body}` : ''}</li>`)
        .join('');

      const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Xin chào ${group.name},</h2>
                    <p>Bạn có thông báo mới từ Recalio:</p>
                    <ul>${itemsHtml}</ul>
                    <hr />
                    <p style="color: #888; font-size: 12px;">Recalio — Học từ vựng thông minh</p>
                </div>
            `;

      await this.notificationProducer.addEmailJob({
        email: group.email,
        subject: 'Thông báo từ Recalio',
        html,
        notificationIds: group.ids,
      });
    }

    this.logger.log(
      `Queued ${notifications.length} email notifications to ${grouped.size} users`,
    );
  }
}
