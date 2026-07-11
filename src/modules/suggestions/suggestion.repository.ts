import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SortOrder } from '../../common/enums/sort.enum';
import { PaginationDto } from '../../common/dtos/pagination.dto';

const suggestionSelect = {
  id: true,
  userId: true,
  content: true,
  isRead: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
} satisfies Prisma.SuggestionSelect;

@Injectable()
export class SuggestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, content: string, email?: string) {
    return this.prisma.suggestion.create({
      data: { userId, content, email: email ?? null },
      select: suggestionSelect,
    });
  }

  async findAll(dto: PaginationDto) {
    const where: Prisma.SuggestionWhereInput = {};

    const [items, total] = await Promise.all([
      this.prisma.suggestion.findMany({
        where,
        skip: dto.skip,
        take: dto.limit,
        orderBy: { createdAt: SortOrder.DESC },
        select: suggestionSelect,
      }),
      this.prisma.suggestion.count({ where }),
    ]);

    return { items, total };
  }

  async findAdminIds() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true, deletedAt: null },
      select: { id: true },
    });
    return admins.map((a) => a.id);
  }

  async findById(id: string) {
    return this.prisma.suggestion.findUnique({
      where: { id },
      select: suggestionSelect,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.suggestion.update({
      where: { id },
      data: { isRead: true },
      select: suggestionSelect,
    });
  }
}
