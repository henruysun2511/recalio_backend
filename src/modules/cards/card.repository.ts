import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma, CardState } from '@prisma/client';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { CARD_CONSTANTS } from './card.constant';

const cardWithNoteSelect = {
    id: true,
    noteId: true,
    deckId: true,
    cardTemplateId: true,
    state: true,
    flags: true,
    due: true,
    note: {
        select: {
            word: true,
            meaning: true,
            ipa: true,
            example: true,
            audioUrl: true,
            templateId: true,
        },
    },
    cardTemplate: {
        select: {
            id: true,
            name: true,
            frontHtml: true,
            backHtml: true,
            css: true,
        },
    },
} satisfies Prisma.CardSelect;

@Injectable()
export class CardRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findDueCards(userId: string, deckId?: string, limit: number = CARD_CONSTANTS.DEFAULT_LIMIT) {
        const where: Prisma.CardWhereInput = {
            userId,
            state: { in: [CardState.NEW, CardState.LEARNING, CardState.RELEARNING, CardState.REVIEW] },
            due: { lte: new Date() },
            note: { deletedAt: null },
            ...(deckId ? { deckId } : {}),
        };

        const [items, total] = await Promise.all([
            this.prisma.card.findMany({
                where,
                orderBy: [
                    { state: 'asc' },
                    { due: 'asc' },
                ],
                take: limit,
                select: cardWithNoteSelect,
            }),
            this.prisma.card.count({ where }),
        ]);

        return { items, total };
    }

    async findById(id: string) {
        return this.prisma.card.findUnique({
            where: { id },
            select: {
                ...cardWithNoteSelect,
                userId: true,
                interval: true,
                easeFactor: true,
                repetitions: true,
                lapses: true,
                currentStep: true,
                lastReviewAt: true,
                fsrsStability: true,
                fsrsDifficulty: true,
            },
        });
    }

    async update(id: string, data: Prisma.CardUpdateInput) {
        return this.prisma.card.update({
            where: { id },
            data,
            select: {
                id: true,
                state: true,
                due: true,
                interval: true,
                easeFactor: true,
                repetitions: true,
                lapses: true,
                currentStep: true,
                lastReviewAt: true,
            },
        });
    }

    async countByState(userId: string, deckId?: string) {
        const where: Prisma.CardWhereInput = {
            userId,
            state: { not: CardState.SUSPENDED },
            note: { deletedAt: null },
            ...(deckId ? { deckId } : {}),
        };

        const grouped = await this.prisma.card.groupBy({
            by: ['state'],
            where,
            _count: true,
        });

        const result: Record<string, number> = { NEW: 0, LEARNING: 0, REVIEW: 0, due: 0 };
        for (const g of grouped) {
            result[g.state] = g._count;
        }

        const dueCount = await this.prisma.card.count({
            where: { ...where, due: { lte: new Date() }, state: { in: [CardState.LEARNING, CardState.RELEARNING, CardState.REVIEW] } },
        });
        result.due = dueCount;

        return result as { NEW: number; LEARNING: number; REVIEW: number; due: number };
    }

    async findByDeck(userId: string, deckId: string, state?: string, page = 1, limit = 20) {
        const where: Prisma.CardWhereInput = {
            userId,
            deckId,
            note: { deletedAt: null },
            ...(state ? { state } : {} as any),
        };

        const [items, total] = await Promise.all([
            this.prisma.card.findMany({
                where,
                orderBy: [{ state: 'asc' }, { due: 'asc' }],
                skip: (page - 1) * limit,
                take: limit,
                select: cardWithNoteSelect,
            }),
            this.prisma.card.count({ where }),
        ]);

        return { items, total };
    }

    async createReviewLog(data: Prisma.ReviewLogCreateInput) {
        return this.prisma.reviewLog.create({ data });
    }
}
