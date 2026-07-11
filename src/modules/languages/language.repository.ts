import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateLanguageDto,
  UpdateLanguageDto,
  LanguageQueryDto,
} from './language.dto';

const languageSelect = {
  id: true,
  name: true,
  nativeName: true,
  flagEmoji: true,
  isSupported: true,
} satisfies Prisma.LanguageSelect;

@Injectable()
export class LanguageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLanguageDto) {
    return this.prisma.language.create({
      data: dto,
      select: languageSelect,
    });
  }

  async findAll(query?: LanguageQueryDto) {
    const where: Prisma.LanguageWhereInput = {};

    if (query?.search) {
      const term = query.search;
      where.OR = [
        { id: { contains: term, mode: 'insensitive' } },
        { name: { contains: term, mode: 'insensitive' } },
        { nativeName: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query?.isSupported !== undefined) {
      where.isSupported = query.isSupported;
    }

    return this.prisma.language.findMany({
      where,
      orderBy: { name: 'asc' },
      select: languageSelect,
    });
  }

  async findAllSupported() {
    return this.prisma.language.findMany({
      where: { isSupported: true },
      orderBy: { name: 'asc' },
      select: languageSelect,
    });
  }

  async findById(id: string) {
    return this.prisma.language.findUnique({
      where: { id },
      select: languageSelect,
    });
  }

  async update(id: string, dto: UpdateLanguageDto) {
    return this.prisma.language.update({
      where: { id },
      data: dto,
      select: languageSelect,
    });
  }

  async delete(id: string) {
    return this.prisma.language.delete({ where: { id } });
  }
}
