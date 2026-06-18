import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { GamificationRepository } from './gamification.repository';
import { NotificationModule } from '../notifications/notification.module';

@Module({
    imports: [NotificationModule],
    controllers: [GamificationController],
    providers: [GamificationService, GamificationRepository],
    exports: [GamificationService],
})
export class GamificationModule { }
