import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { ReportRepository } from './report.repository';
import { CreateReportDto } from './report.dto';
import { ReportError } from './report.error';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { DeckService } from '../decks/deck.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly repo: ReportRepository,
    private readonly deckService: DeckService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(userId: string, deckId: string, dto: CreateReportDto) {
    const ownerId = await this.deckService.getOwner(deckId);
    if (!ownerId) throw ReportError.deckNotFound();
    if (ownerId === userId) throw ReportError.cannotReportOwn();

    const existing = await this.repo.findExistingReport(userId, deckId);
    if (existing) throw ReportError.alreadyReported();

    const report = await this.repo.create(userId, deckId, dto);

    const adminIds = await this.repo.findAdminIds();
    for (const adminId of adminIds) {
      await this.notificationService.notifyUser(
        adminId,
        NotificationType.DECK_REPORTED,
        'Deck bị báo cáo',
        `Deck ${deckId} bị báo cáo với lý do: ${dto.reason}`,
        { deckId, reportId: report.id },
      );
    }
    this.logger.log(`Report ${report.id}: notified ${adminIds.length} admins`);

    return report;
  }

  async findAll(dto: PaginationDto) {
    const { items, total } = await this.repo.findAll(dto);
    return paginate(items, total, dto);
  }
}
