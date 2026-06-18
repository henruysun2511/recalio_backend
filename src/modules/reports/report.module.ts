import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { DeckModule } from '../decks/deck.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
    imports: [DeckModule, NotificationModule],
    controllers: [ReportController],
    providers: [ReportService, ReportRepository],
    exports: [ReportService, ReportRepository],
})
export class ReportModule { }
