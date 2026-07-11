import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { PostQueryDto } from './post.dto';
import { ReportReason, ReportStatus } from '@prisma/client';

const postInclude = {
  user: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
  decks: {
    include: {
      deck: {
        select: {
          id: true,
          name: true,
          fullPath: true,
          coverImage: true,
          description: true,
          _count: { select: { cards: true } },
        },
      },
    },
    orderBy: { orderIndex: 'asc' as const },
  },
  _count: { select: { comments: true } },
} as const;

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPost(post: any) {
    if (!post) return post;
    return {
      ...post,
      decks: post.decks?.map((pd: any) => ({
        ...pd.deck,
        orderIndex: pd.orderIndex,
      })),
      isLiked: post.isLiked ?? false,
    };
  }

  private mapPosts(posts: any[]) {
    return posts.map((p) => this.mapPost(p));
  }

  async create(data: {
    userId: string;
    title: string;
    content?: string;
    tags: string[];
    isPublished?: boolean;
    publishedAt?: Date;
    deckIds: { deckId: string; orderIndex: number }[];
  }) {
    const post = await this.prisma.post.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        tags: data.tags,
        isPublished: data.isPublished ?? false,
        publishedAt: data.publishedAt,
        decks: {
          create: data.deckIds,
        },
      },
      include: postInclude,
    });
    return this.mapPost(post);
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });
    return this.mapPost(post);
  }

  async findAll(currentUserId: string, dto: PostQueryDto) {
    const { page = 1, limit = 10, search, tag, userId } = dto;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null, isBanned: false, isPublished: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tag) {
      where.tags = { has: tag };
    }
    if (userId) {
      where.userId = userId;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: postInclude,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    if (currentUserId) {
      const postIds = posts.map((p: any) => p.id);
      const likes = await this.prisma.postLike.findMany({
        where: { userId: currentUserId, postId: { in: postIds } },
        select: { postId: true },
      });
      const likedSet = new Set(likes.map((l: any) => l.postId));
      for (const post of posts) {
        (post as any).isLiked = likedSet.has(post.id);
      }
    }

    return { posts: this.mapPosts(posts), total };
  }

  async findAllAdmin(dto: PostQueryDto) {
    const { page = 1, limit = 10, search, userId } = dto;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null, reports: { some: {} } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (userId) where.userId = userId;

    const reportInclude = { where: { status: ReportStatus.PENDING }, take: 5 };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          ...postInclude,
          reports: reportInclude,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts: this.mapPosts(posts), total };
  }

  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      tags?: string[];
      isPublished?: boolean;
      publishedAt?: Date | null;
    },
  ) {
    return this.prisma.post.update({
      where: { id },
      data,
      include: postInclude,
    });
  }

  async replaceDecks(
    postId: string,
    deckIds: { deckId: string; orderIndex: number }[],
  ) {
    await this.prisma.postDeck.deleteMany({ where: { postId } });
    if (deckIds.length > 0) {
      await this.prisma.postDeck.createMany({
        data: deckIds.map((d) => ({ ...d, postId })),
      });
    }
  }

  async softDelete(id: string) {
    return this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async ban(id: string, isBanned: boolean) {
    return this.prisma.post.update({
      where: { id },
      data: { isBanned, bannedAt: isBanned ? new Date() : null },
    });
  }

  async createReport(data: {
    reportedById: string;
    postId: string;
    reason: ReportReason;
    description?: string;
  }) {
    return this.prisma.postReport.create({ data: data as any });
  }

  async findExistingReport(reportedById: string, postId: string) {
    return this.prisma.postReport.findFirst({
      where: { reportedById, postId },
    });
  }

  async findDecksByUser(deckIds: string[], userId: string) {
    const decks = await this.prisma.deck.findMany({
      where: { id: { in: deckIds }, userId },
      select: { id: true },
    });
    return new Set(decks.map((d) => d.id));
  }

  async findLike(userId: string, postId: string) {
    return this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
  }

  async addLike(userId: string, postId: string) {
    const [like] = await Promise.all([
      this.prisma.postLike.create({ data: { userId, postId } }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return like;
  }

  async removeLike(userId: string, postId: string) {
    const [like] = await Promise.all([
      this.prisma.postLike.delete({
        where: { userId_postId: { userId, postId } },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return like;
  }
}
