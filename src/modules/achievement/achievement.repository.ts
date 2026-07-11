import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { paginate } from '../../common/utils/paginate.util';
import { QueryAchievementDto } from './achievement.dto';

@Injectable()
export class AchievementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: QueryAchievementDto) {
    const where: any = {};

    if (dto.search) {
      where.OR = [
        { key: { contains: dto.search, mode: 'insensitive' } },
        { name: { contains: dto.search, mode: 'insensitive' } },
        { description: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    if (dto.conditionType) {
      where.condition = {
        path: ['type'],
        equals: dto.conditionType,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.achievement.findMany({
        where,
        orderBy: { key: dto.sortOrder },
        skip: dto.skip,
        take: dto.limit,
      }),
      this.prisma.achievement.count({ where }),
    ]);

    return paginate(items, total, dto);
  }

  async findOne(id: string) {
    return this.prisma.achievement.findUnique({ where: { id } });
  }

  async findByKey(key: string) {
    return this.prisma.achievement.findUnique({ where: { key } });
  }

  async create(data: {
    key: string;
    name: string;
    description: string;
    iconUrl?: string | null;
    xpReward: number;
    condition: { type: string; value: number };
  }) {
    return this.prisma.achievement.create({ data });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      iconUrl?: string | null;
      xpReward?: number;
      condition?: { type: string; value: number };
    },
  ) {
    return this.prisma.achievement.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.achievement.delete({ where: { id } });
  }
}
