import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueName, JobName } from '../queue.constant';
import { NotificationType, NotificationChannel } from '@prisma/client';

export interface SendNotificationJobData {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
    channel?: NotificationChannel;
}

export interface BroadcastNotificationJobData {
    adminId: string;
    type: NotificationType;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
    channel?: NotificationChannel;
}

export interface SendEmailNotificationJobData {
    email: string;
    subject: string;
    html: string;
    notificationIds: string[];
}

@Injectable()
export class NotificationProducer {
    constructor(@InjectQueue(QueueName.NOTIFICATION) private readonly queue: Queue) { }

    async addSendJob(data: SendNotificationJobData) {
        return this.queue.add(JobName.SEND_NOTIFICATION, data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 5000 },
        });
    }

    async addBroadcastJob(data: BroadcastNotificationJobData) {
        return this.queue.add(JobName.BROADCAST_NOTIFICATION, data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 5000 },
        });
    }

    async addEmailJob(data: SendEmailNotificationJobData) {
        return this.queue.add(JobName.SEND_EMAIL_NOTIFICATION, data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 5000 },
        });
    }
}
