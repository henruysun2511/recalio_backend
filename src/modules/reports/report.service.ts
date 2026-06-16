import { Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { CreateReportDto, UpdateReportStatusDto } from './report.dto';
import { ReportError } from './report.error';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { DeckService } from '../decks/deck.service';

@Injectable()
export class ReportService {
    constructor(
        private readonly repo: ReportRepository,
        private readonly deckService: DeckService,
    ) { }

    async create(userId: string, deckId: string, dto: CreateReportDto) {
        const ownerId = await this.deckService.getOwner(deckId);
        if (!ownerId) throw ReportError.deckNotFound();
        if (ownerId === userId) throw ReportError.cannotReportOwn();

        const existing = await this.repo.findExistingReport(userId, deckId);
        if (existing) throw ReportError.alreadyReported();

        return this.repo.create(userId, deckId, dto);
    }

    async findAll(dto: PaginationDto) {
        const { items, total } = await this.repo.findAll(dto);
        return paginate(items, total, dto);
    }

    async updateStatus(id: string, dto: UpdateReportStatusDto) {
        const report = await this.repo.findById(id);
        if (!report) throw ReportError.notFound();

        return this.repo.updateStatus(id, dto);
    }
}
