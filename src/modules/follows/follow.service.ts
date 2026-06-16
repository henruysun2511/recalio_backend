import { Injectable } from '@nestjs/common';
import { FollowRepository } from './follow.repository';
import { FollowError } from './follow.error';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { UserService } from '../users/user.service';

@Injectable()
export class FollowService {
    constructor(
        private readonly repo: FollowRepository,
        private readonly userService: UserService,
    ) { }

    async follow(userId: string, targetId: string) {
        if (userId === targetId) throw FollowError.cannotFollowSelf();

        const target = await this.userService.findById(targetId);
        if (!target) throw FollowError.userNotFound();

        const existing = await this.repo.findFollow(userId, targetId);
        if (existing) throw FollowError.alreadyFollowing();

        return this.repo.follow(userId, targetId);
    }

    async unfollow(userId: string, targetId: string) {
        if (userId === targetId) throw FollowError.cannotFollowSelf();

        const existing = await this.repo.findFollow(userId, targetId);
        if (!existing) throw FollowError.notFollowing();

        await this.repo.unfollow(userId, targetId);
    }

    async getFollowingStatus(userId: string, targetId: string) {
        const existing = await this.repo.findFollow(userId, targetId);
        return { isFollowing: !!existing };
    }

    async getFollowing(userId: string, dto: PaginationDto) {
        const { items, total } = await this.repo.findFollowing(userId, dto);
        return paginate(
            items.map((item) => ({ ...item.following, followedAt: item.followedAt })),
            total,
            dto,
        );
    }

    async getFollowers(userId: string, dto: PaginationDto) {
        const { items, total } = await this.repo.findFollowers(userId, dto);
        return paginate(
            items.map((item) => ({ ...item.follower, followedAt: item.followedAt })),
            total,
            dto,
        );
    }
}
