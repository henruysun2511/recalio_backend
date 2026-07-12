import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { UpdateUserDto, UserQueryDto, UpdateUserRoleDto } from './user.dto';
import { Prisma } from '@prisma/client';

const userSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  role: true,
  isActive: true,
  timezone: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: userSelect,
    });
  }

  async findByIdIncludeDeleted(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { ...userSelect, deletedAt: true },
    });
  }

  async softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: userSelect,
    });
  }

  async findAll(dto: UserQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: userSelect,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSelect,
    });
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!user) return null;

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: userSelect,
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      select: userSelect,
    });
  }

  async countFollowers(userId: string) {
    return this.prisma.userFollow.count({ where: { followingId: userId } });
  }

  async countFollowing(userId: string) {
    return this.prisma.userFollow.count({ where: { followerId: userId } });
  }

  async getUserStats(userId: string) {
    const [totalCards, totalReviews, studyTimeAgg, studyDaysResult] =
      await Promise.all([
        this.prisma.card.count({ where: { userId } }),
        this.prisma.reviewLog.count({ where: { userId } }),
        this.prisma.reviewLog.aggregate({
          where: { userId },
          _sum: { responseTimeMs: true },
        }),
        this.prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(DISTINCT DATE("reviewedAt")) as count
                FROM review_logs
                WHERE "userId" = ${userId}
            `,
      ]);
    return {
      totalCards,
      totalReviews,
      totalStudyTimeMs: studyTimeAgg._sum.responseTimeMs ?? 0,
      totalStudyDays: Number(studyDaysResult[0]?.count ?? 0),
    };
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: userSelect,
    });
  }

  async findLanguages(userId: string) {
    return this.prisma.userLanguage.findMany({
      where: { userId },
      include: {
        language: {
          select: { id: true, name: true, nativeName: true, flagEmoji: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }
}
