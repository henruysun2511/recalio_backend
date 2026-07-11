import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateReviewDto, ReviewQueryDto } from './review.dto';
import { SortOrder } from '../../common/enums/sort.enum';

const reviewUserSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
};

const reviewPublicSelect = {
  id: true,
  deckId: true,
  rating: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  user: { select: reviewUserSelect },
} satisfies Prisma.DeckReviewSelect;

const reviewMineSelect = {
    id: true,
    deckId: true,
    userId: true,
    rating: true,
    comment: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.DeckReviewSelect;

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, deckId: string, dto: CreateReviewDto) {
    return this.prisma.deckReview.upsert({
      where: { deckId_userId: { deckId, userId } },
      create: { userId, deckId, rating: dto.rating, comment: dto.comment },
      update: { rating: dto.rating, comment: dto.comment },
      select: reviewMineSelect,
    });
  }

  async findById(id: string) {
    return this.prisma.deckReview.findUnique({
      where: { id },
      select: reviewMineSelect,
    });
  }

  async findByUserAndDeck(userId: string, deckId: string) {
    return this.prisma.deckReview.findUnique({
      where: { deckId_userId: { deckId, userId } },
      select: reviewMineSelect,
    });
  }

  async findPublicByDeck(deckId: string, dto: ReviewQueryDto) {
    const where = { deckId };
    const [items, total] = await Promise.all([
      this.prisma.deckReview.findMany({
        where,
        skip: dto.skip,
        take: dto.limit,
        orderBy: { [dto.sort ?? 'createdAt']: dto.sortOrder ?? SortOrder.DESC },
        select: reviewPublicSelect,
      }),
      this.prisma.deckReview.count({ where }),
    ]);
    return { items, total };
  }

  async delete(id: string) {
    return this.prisma.deckReview.delete({ where: { id } });
  }
}
