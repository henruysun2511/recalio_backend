import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';

@Injectable()
export class GamificationRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getXp(userId: string) {
        return this.prisma.userXP.findUnique({ where: { userId } });
    }

    async upsertXp(userId: string, totalXP: number, level: number, currentStreak: number, longestStreak: number, lastStudyDate: Date, dailyGoalClaimedAt?: Date | null) {
        return this.prisma.userXP.upsert({
            where: { userId },
            create: { userId, totalXP, level, currentStreak, longestStreak, lastStudyDate, dailyGoalClaimedAt },
            update: { totalXP, level, currentStreak, longestStreak, lastStudyDate, dailyGoalClaimedAt },
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

    async getDailyGoal(userId: string) {
        return this.prisma.dailyGoal.findUnique({ where: { userId } });
    }
}
