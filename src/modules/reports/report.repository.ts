import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateReportDto, UpdateReportStatusDto } from './report.dto';
import { SortOrder } from '../../common/enums/sort.enum';
import { PaginationDto } from '../../common/dtos/pagination.dto';

const reportAdminSelect = {
    id: true,
    deckId: true,
    reason: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    reportedBy: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    deck: { select: { id: true, userId: true, name: true, isBanned: true, isArchived: true, deletedAt: true } },
} satisfies Prisma.DeckReportSelect;

@Injectable()
export class ReportRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findExistingReport(reportedById: string, deckId: string) {
        return this.prisma.deckReport.findFirst({
            where: { reportedById, deckId, status: 'PENDING' },
            select: { id: true },
        });
    }

    async create(reportedById: string, deckId: string, dto: CreateReportDto) {
        return this.prisma.deckReport.create({
            data: {
                reportedById,
                deckId,
                reason: dto.reason,
                description: dto.description,
            },
        });
    }

    async findAll(dto: PaginationDto) {
        const where: any = {};

        const [items, total] = await Promise.all([
            this.prisma.deckReport.findMany({
                where,
                skip: dto.skip,
                take: dto.limit,
                orderBy: { createdAt: SortOrder.DESC },
                select: reportAdminSelect,
            }),
            this.prisma.deckReport.count({ where }),
        ]);

        return { items, total };
    }

    async findById(id: string) {
        return this.prisma.deckReport.findUnique({
            where: { id },
            select: reportAdminSelect,
        });
    }

    async updateStatus(id: string, dto: UpdateReportStatusDto) {
        return this.prisma.deckReport.update({
            where: { id },
            data: {
                status: dto.status,
            },
            select: reportAdminSelect,
        });
    }
}
