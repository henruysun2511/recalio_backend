import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';

@Injectable()
export class GamificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getXp(userId: string) {
    return this.prisma.userXP.findUnique({ where: { userId } });
  }

  async upsertXp(
    userId: string,
    totalXP: number,
    level: number,
    currentStreak: number,
    longestStreak: number,
    lastStudyDate: Date,
    dailyGoalClaimedAt?: Date | null,
  ) {
    return this.prisma.userXP.upsert({
      where: { userId },
      create: {
        userId,
        totalXP,
        level,
        currentStreak,
        longestStreak,
        lastStudyDate,
        dailyGoalClaimedAt,
      },
      update: {
        totalXP,
        level,
        currentStreak,
        longestStreak,
        lastStudyDate,
        dailyGoalClaimedAt,
      },
    });
  }

  async getAllAchievements() {
    return this.prisma.achievement.findMany({ orderBy: { key: 'asc' } });
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      select: { earnedAt: true, achievement: true },
    });
  }

  async unlockAchievement(userId: string, achievementId: string) {
    return this.prisma.userAchievement.create({
      data: { userId, achievementId },
      select: { achievement: true, earnedAt: true },
    });
  }

  async isAchievementUnlocked(userId: string, achievementId: string) {
    const ua = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });
    return !!ua;
  }

  async getLeaderboard(limit: number) {
    return this.prisma.userXP.findMany({
      orderBy: { totalXP: 'desc' },
      take: limit,
      select: {
        totalXP: true,
        level: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  async getTotalReviews(userId: string) {
    return this.prisma.reviewLog.count({ where: { userId } });
  }

  async getTodayReviewCount(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.reviewLog.count({
      where: { userId, reviewedAt: { gte: today } },
    });
  }

  async getTotalCards(userId: string) {
    return this.prisma.card.count({ where: { userId } });
  }

  async getCurrentStreak(userId: string) {
    const xp = await this.prisma.userXP.findUnique({
      where: { userId },
      select: { currentStreak: true },
    });
    return xp?.currentStreak ?? 0;
  }

  async getReviewCountsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
            SELECT DATE("reviewedAt") as date, COUNT(*)::int as count
            FROM review_logs
            WHERE "userId" = ${userId}
              AND "reviewedAt" >= ${startDate}
              AND "reviewedAt" <= ${endDate}
            GROUP BY DATE("reviewedAt")
            ORDER BY date ASC
        `;
  }

  async getDistinctReviewDates(userId: string) {
    return this.prisma.$queryRaw<{ date: Date }[]>`
            SELECT DISTINCT DATE("reviewedAt") as date
            FROM review_logs
            WHERE "userId" = ${userId}
            ORDER BY date DESC
        `;
  }

  async getRetentionRate(userId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<{ rate: number }[]>`
            SELECT
                COUNT(*) FILTER (WHERE "rating" IN ('GOOD', 'EASY'))::float / NULLIF(COUNT(*), 0) as rate
            FROM review_logs
            WHERE "userId" = ${userId}
        `;
    return result[0]?.rate ?? 0;
  }

  async getAvgResponseTimeByRating(userId: string) {
    const result = await this.prisma.$queryRaw<
      { rating: string; avg: number }[]
    >`
            SELECT "rating", AVG("responseTimeMs")::float / 1000.0 as avg
            FROM review_logs
            WHERE "userId" = ${userId}
            GROUP BY "rating"
        `;
    return result;
  }

  async getDailyGoal(userId: string) {
    return this.prisma.dailyGoal.findUnique({ where: { userId } });
  }

  async upsertDailyGoal(
    userId: string,
    data: { targetReviews?: number; targetNewCards?: number },
  ) {
    return this.prisma.dailyGoal.upsert({
      where: { userId },
      create: {
        userId,
        targetReviews: data.targetReviews ?? 50,
        targetNewCards: data.targetNewCards ?? 20,
      },
      update: { ...data },
    });
  }
}
