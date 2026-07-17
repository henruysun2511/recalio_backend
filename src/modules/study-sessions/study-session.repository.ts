import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma, ReviewRating, SessionType } from '@prisma/client';

const sessionSelect = {
  id: true,
  deckId: true,
  sessionType: true,
  startedAt: true,
  endedAt: true,
} satisfies Prisma.StudySessionSelect;

const sessionDetailSelect = {
  ...sessionSelect,
  userId: true,
} satisfies Prisma.StudySessionSelect;

@Injectable()
export class StudySessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, deckId: string | undefined, sessionType: SessionType = SessionType.NORMAL) {
    return this.prisma.studySession.create({
      data: { userId, deckId, sessionType },
      select: sessionSelect,
    });
  }

  async findById(id: string) {
    return this.prisma.studySession.findUnique({
      where: { id },
      select: sessionDetailSelect,
    });
  }

  async update(id: string, data: Prisma.StudySessionUpdateInput) {
    return this.prisma.studySession.update({
      where: { id },
      data,
      select: sessionSelect,
    });
  }

  async findByUser(userId: string, deckId?: string, page = 1, limit = 20) {
    const where: Prisma.StudySessionWhereInput = {
      userId,
      ...(deckId ? { deckId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.studySession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: sessionSelect,
      }),
      this.prisma.studySession.count({ where }),
    ]);

    return { items, total };
  }

  async getSessionReviewStats(sessionId: string) {
    const result = await this.prisma.reviewLog.groupBy({
      by: ['rating'],
      where: { sessionId },
      _count: true,
      _sum: { responseTimeMs: true },
    });

    let totalTimeMs = 0;
    let again = 0,
      hard = 0,
      good = 0,
      easy = 0;
    for (const row of result) {
      totalTimeMs += row._sum.responseTimeMs ?? 0;
      if (row.rating === ReviewRating.AGAIN) again = row._count;
      else if (row.rating === ReviewRating.HARD) hard = row._count;
      else if (row.rating === ReviewRating.GOOD) good = row._count;
      else if (row.rating === ReviewRating.EASY) easy = row._count;
    }

    return {
      reviewedCards: result.reduce((s, r) => s + r._count, 0),
      timeSpentMs: totalTimeMs,
      again,
      hard,
      good,
      easy,
    };
  }

  async findActiveByUserAndDeck(userId: string, deckId: string) {
    return this.prisma.studySession.findFirst({
      where: { userId, deckId, endedAt: null },
      select: sessionSelect,
    });
  }

  async countActiveSessions(userId: string) {
    return this.prisma.studySession.count({
      where: { userId, endedAt: null },
    });
  }

  async findReviewLogs(sessionId: string, page: number, limit: number) {
    const where = { sessionId };

    const [items, total] = await Promise.all([
      this.prisma.reviewLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { reviewedAt: 'asc' },
        include: {
          card: {
            select: {
              variantIndex: true,
              note: {
                select: {
                  word: true,
                  meaning: true,
                  fields: true,
                  imageUrl: true,
                  template: { select: { type: true } },
                  occlusionMasks: {
                    select: { x: true, y: true, width: true, height: true, groupIndex: true, label: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.reviewLog.count({ where }),
    ]);

    return { items, total };
  }
}
