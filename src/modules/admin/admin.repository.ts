import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';

@Injectable()
export class AdminRepository {
    constructor(private readonly prisma: PrismaService) { }

    async countUsers() {
        return this.prisma.user.count({ where: { deletedAt: null } });
    }

    async countNewUsersToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.prisma.user.count({ where: { createdAt: { gte: today } } });
    }

    async countDecks() {
        return this.prisma.deck.count({ where: { deletedAt: null } });
    }

    async countPublicDecks() {
        return this.prisma.deck.count({ where: { isPublic: true, isBanned: false, deletedAt: null } });
    }

    async countReviews() {
        return this.prisma.reviewLog.count();
    }

    async countReviewsToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.prisma.reviewLog.count({ where: { reviewedAt: { gte: today } } });
    }

    async countPendingReports() {
        return this.prisma.deckReport.count({ where: { status: 'PENDING' } });
    }

    async findRecentReports(limit: number = 5) {
        return this.prisma.deckReport.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                reason: true,
                createdAt: true,
                deck: { select: { id: true, name: true } },
                reportedBy: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
        });
    }

    async findRecentUsers(limit: number = 5) {
        return this.prisma.user.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            where: { deletedAt: null },
            select: { id: true, username: true, displayName: true, email: true, avatarUrl: true, createdAt: true },
        });
    }

    async getUserGrowthLast30Days() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const results = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
            SELECT DATE("createdAt") as date, COUNT(*) as count
            FROM users
            WHERE "createdAt" >= ${thirtyDaysAgo} AND "deletedAt" IS NULL
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

        return results.map((r) => ({
            date: r.date,
            count: Number(r.count),
        }));
    }

    async getReviewCountLast30Days() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const results = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
            SELECT DATE("reviewedAt") as date, COUNT(*) as count
            FROM review_logs
            WHERE "reviewedAt" >= ${thirtyDaysAgo}
            GROUP BY DATE("reviewedAt")
            ORDER BY date ASC
        `;

        return results.map((r) => ({
            date: r.date,
            count: Number(r.count),
        }));
    }
}
