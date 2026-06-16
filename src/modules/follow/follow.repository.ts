import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { SortOrder } from '../../common/enums/sort.enum';
import { PaginationDto } from '../../common/dtos/pagination.dto';

const userSelect = {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
};

const followingSelect = {
    following: { select: userSelect },
    followedAt: true,
};

const followerSelect = {
    follower: { select: userSelect },
    followedAt: true,
};

@Injectable()
export class FollowRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findFollow(followerId: string, followingId: string) {
        return this.prisma.userFollow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
    }

    async countFollowers(userId: string) {
        return this.prisma.userFollow.count({ where: { followingId: userId } });
    }

    async countFollowing(userId: string) {
        return this.prisma.userFollow.count({ where: { followerId: userId } });
    }

    async follow(followerId: string, followingId: string) {
        return this.prisma.userFollow.create({
            data: { followerId, followingId },
            select: followingSelect,
        });
    }

    async unfollow(followerId: string, followingId: string) {
        return this.prisma.userFollow.delete({
            where: { followerId_followingId: { followerId, followingId } },
        });
    }

    async findFollowing(userId: string, dto: PaginationDto) {
        const [items, total] = await Promise.all([
            this.prisma.userFollow.findMany({
                where: { followerId: userId },
                skip: dto.skip,
                take: dto.limit,
                orderBy: { followedAt: SortOrder.DESC },
                select: followingSelect,
            }),
            this.prisma.userFollow.count({ where: { followerId: userId } }),
        ]);
        return { items, total };
    }

    async findFollowers(userId: string, dto: PaginationDto) {
        const [items, total] = await Promise.all([
            this.prisma.userFollow.findMany({
                where: { followingId: userId },
                skip: dto.skip,
                take: dto.limit,
                orderBy: { followedAt: SortOrder.DESC },
                select: followerSelect,
            }),
            this.prisma.userFollow.count({ where: { followingId: userId } }),
        ]);
        return { items, total };
    }
}
