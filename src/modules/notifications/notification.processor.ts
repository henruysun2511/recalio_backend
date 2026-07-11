import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueName, JobName } from '../../infrastructures/queue/queue.constant';
import { NotificationRepository } from './notification.repository';
import { MailerService } from '../../infrastructures/mailer/mailer.service';
import { NotificationChannel } from '@prisma/client';
import {
  SendNotificationJobData,
  BroadcastNotificationJobData,
  SendEmailNotificationJobData,
} from '../../infrastructures/queue/producers/notification.producer';

@Processor(QueueName.NOTIFICATION)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly mailer: MailerService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case JobName.SEND_NOTIFICATION: {
        const data = job.data as SendNotificationJobData;
        const { userId, type, title, body, data: payload, channel } = data;
        await this.repo.createOne({
          type,
          title,
          body: body ?? '',
          data: (payload ?? {}) as any,
          channel: channel ?? NotificationChannel.WEB_PUSH,
          user: { connect: { id: userId } },
        });
        break;
      }
      case JobName.BROADCAST_NOTIFICATION: {
        const data = job.data as BroadcastNotificationJobData;
        const { adminId, type, title, body, data: payload, channel } = data;
        const resolvedChannel = channel ?? NotificationChannel.EMAIL;
        const userIds = await this.repo.getEligibleUserIds(resolvedChannel);
        if (!userIds.length) return;

        const batchSize = 500;
        const baseData = {
          type,
          title,
          body: body ?? '',
          data: (payload ?? {}) as any,
          channel: resolvedChannel,
        };

        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize).map((uid) => ({
            ...baseData,
            userId: uid,
          }));
          await this.repo.createMany(batch);
        }
        this.logger.log(
          `Broadcasted notification to ${userIds.length} users (triggered by admin ${adminId})`,
        );
        break;
      }
      case JobName.SEND_EMAIL_NOTIFICATION: {
        const data = job.data as SendEmailNotificationJobData;
        const { email, subject, html, notificationIds } = data;

        const ok = await this.mailer.sendMail(email, subject, html);
        if (ok) {
          await this.repo.markEmailSent(notificationIds);
        } else {
          throw new Error(`Failed to send email to ${email}`);
        }
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed: ${job.name}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed: ${job.name} — ${err.message}`);
  }
}
