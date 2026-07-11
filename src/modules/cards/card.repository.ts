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
  due: true,
  note: {
    select: {
      word: true,
      meaning: true,
      ipa: true,
      partOfSpeech: true,
      example: true,
      audioUrl: true,
      imageUrl: true,
      fields: true,
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
  constructor(private readonly prisma: PrismaService) {}

  async findDueCards(
    userId: string,
    deckId?: string,
    limit: number = CARD_CONSTANTS.DEFAULT_LIMIT,
    newLimit?: number | null,
    reviewLimit?: number | null,
  ) {
    const baseWhere: Prisma.CardWhereInput = {
      userId,
      state: {
        in: [
          CardState.NEW,
          CardState.LEARNING,
          CardState.RELEARNING,
          CardState.REVIEW,
        ],
      },
      due: { lte: new Date() },
      note: { deletedAt: null },
      ...(deckId ? { deckId } : {}),
    };

    let items: any[] = [];
    if (newLimit === undefined || newLimit === null || newLimit > 0) {
      items = items.concat(
        await this.prisma.card.findMany({
          where: { ...baseWhere, state: CardState.NEW },
          orderBy: { due: 'asc' },
          take: newLimit != null ? Math.min(newLimit, limit) : limit,
          select: cardWithNoteSelect,
        }),
      );
    }
    if (reviewLimit === undefined || reviewLimit === null || reviewLimit > 0) {
      items = items.concat(
        await this.prisma.card.findMany({
          where: {
            ...baseWhere,
            state: {
              in: [CardState.LEARNING, CardState.RELEARNING, CardState.REVIEW],
            },
          },
          orderBy: { due: 'asc' },
          take: reviewLimit != null ? Math.min(reviewLimit, limit) : limit,
          select: cardWithNoteSelect,
        }),
      );
    }

    const total = await this.prisma.card.count({ where: baseWhere });

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
        deck: {
          select: {
            setting: {
              select: {
                algorithm: true,
                newCardsPerDay: true,
                reviewsPerDay: true,
                learningSteps: true,
                graduatingInterval: true,
                easyInterval: true,
                intervalModifier: true,
                easyBonus: true,
                hardInterval: true,
                maximumInterval: true,
                lapseSteps: true,
                minimumInterval: true,
                leechThreshold: true,
                leechAction: true,
                requestRetention: true,
              },
            },
          },
        },
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
    const baseWhere: Prisma.CardWhereInput = {
      userId,
      note: { deletedAt: null },
      ...(deckId ? { deckId } : {}),
    };

    const grouped = await this.prisma.card.groupBy({
      by: ['state'],
      where: baseWhere,
      _count: true,
    });

    const result: Record<string, number> = {
      NEW: 0,
      LEARNING: 0,
      REVIEW: 0,
      SUSPENDED: 0,
      due: 0,
    };
    for (const g of grouped) {
      result[g.state] = g._count;
    }

    const activeWhere: Prisma.CardWhereInput = {
      ...baseWhere,
      state: { not: CardState.SUSPENDED },
    };
    const dueCount = await this.prisma.card.count({
      where: {
        ...activeWhere,
        due: { lte: new Date() },
        state: {
          in: [CardState.LEARNING, CardState.RELEARNING, CardState.REVIEW],
        },
      },
    });
    result.due = dueCount;

    return result as {
      NEW: number;
      LEARNING: number;
      REVIEW: number;
      SUSPENDED: number;
      due: number;
    };
  }

  async findByDeck(
    userId: string,
    deckId: string,
    state?: string,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.CardWhereInput = {
      userId,
      deckId,
      note: { deletedAt: null },
      ...(state ? { state: state as CardState } : {}),
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

  async findDeckSettings(deckId: string) {
    const setting = await this.prisma.deckSetting.findUnique({
      where: { deckId },
      select: {
        newCardsPerDay: true,
        reviewsPerDay: true,
      },
    });
    return setting;
  }

  async countTodayReviews(userId: string, deckId: string, since: Date) {
    const [newCards, reviewCards] = await Promise.all([
      this.prisma.reviewLog.count({
        where: {
          userId,
          card: { deckId },
          stateBefore: CardState.NEW,
          reviewedAt: { gte: since },
        },
      }),
      this.prisma.reviewLog.count({
        where: {
          userId,
          card: { deckId },
          stateBefore: {
            in: [CardState.LEARNING, CardState.RELEARNING, CardState.REVIEW],
          },
          reviewedAt: { gte: since },
        },
      }),
    ]);
    return { newCards, reviewCards };
  }
}
