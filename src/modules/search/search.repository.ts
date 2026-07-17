import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { SearchQueryDto } from './search.dto';

const deckSearchSelect = {
  id: true,
  name: true,
  fullPath: true,
  description: true,
  coverImage: true,
  tags: true,
  downloadCount: true,
  isFeatured: true,
  createdAt: true,
  user: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
  _count: { select: { notes: true, cards: true } },
} as const;

const postSearchSelect = {
  id: true,
  title: true,
  content: true,
  tags: true,
  likeCount: true,
  createdAt: true,
  user: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
} as const;

const userSearchSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
} as const;

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchDecks(q: string, dto: SearchQueryDto) {
    const where = {
      isPublic: true,
      isBanned: false,
      isArchived: false,
      deletedAt: null,
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
        { tags: { has: q.toLowerCase() } },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.deck.findMany({
        where,
        skip: dto.skip,
        take: dto.take,
        orderBy: { createdAt: 'desc' },
        select: deckSearchSelect,
      }),
      this.prisma.deck.count({ where }),
    ]);

    return { items, total };
  }

  async searchPosts(q: string, dto: SearchQueryDto) {
    const where = {
      isPublished: true,
      isBanned: false,
      deletedAt: null,
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { content: { contains: q, mode: 'insensitive' as const } },
        { tags: { has: q.toLowerCase() } },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip: dto.skip,
        take: dto.take,
        orderBy: { createdAt: 'desc' },
        select: postSearchSelect,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, total };
  }

  async searchUsers(q: string, dto: SearchQueryDto) {
    const where = {
      isActive: true,
      deletedAt: null,
      OR: [
        { username: { contains: q, mode: 'insensitive' as const } },
        { displayName: { contains: q, mode: 'insensitive' as const } },
        { bio: { contains: q, mode: 'insensitive' as const } },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: dto.skip,
        take: dto.take,
        orderBy: { createdAt: 'desc' },
        select: userSearchSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }
}