import { Module } from '@nestjs/common';
import { MailerModule } from '../../infrastructures/mailer/mailer.module';
import { QueueModule } from '../../infrastructures/queue/queue.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationCron } from './notification.cron';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [MailerModule, QueueModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationCron,
    NotificationProcessor,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
