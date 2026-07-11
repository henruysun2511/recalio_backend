import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
    constructor(private readonly repo: AdminRepository) { }

    async getDashboard() {
        const [
            totalUsers,
            newUsersToday,
            totalDecks,
            publicDecks,
            totalReviews,
            reviewsToday,
            pendingReports,
            recentReports,
            recentUsers,
            userGrowth,
            reviewCounts,
        ] = await Promise.all([
            this.repo.countUsers(),
            this.repo.countNewUsersToday(),
            this.repo.countDecks(),
            this.repo.countPublicDecks(),
            this.repo.countReviews(),
            this.repo.countReviewsToday(),
            this.repo.countPendingReports(),
            this.repo.findRecentReports(),
            this.repo.findRecentUsers(),
            this.repo.getUserGrowthLast30Days(),
            this.repo.getReviewCountLast30Days(),
        ]);

        return {
            totalUsers,
            newUsersToday,
            totalDecks,
            publicDecks,
            totalReviews,
            reviewsToday,
            pendingReports,
            recentReports,
            recentUsers,
            userGrowth,
            reviewCounts,
        };
    }
}
